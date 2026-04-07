import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;

// Get or create Puppeteer browser instance
async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    return browserInstance;
  }

  try {
    // Try headless mode with no sandbox (Vercel environment)
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    return browserInstance;
  } catch (error) {
    console.error('Failed to launch Puppeteer:', error);
    throw new Error('PDF generation unavailable');
  }
}

export class PDFService {
  // Generate PDF from incident data
  static async generateIncidentPDF(incident: any): Promise<Buffer> {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      const html = this.generateIncidentHTML(incident);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  // Generate HTML for incident report
  private static generateIncidentHTML(incident: any): string {
    const formatDate = (date: string) => new Date(date).toLocaleString();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Incident Report - ${incident.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
          }
          header {
            border-bottom: 3px solid #0066cc;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 {
            color: #0066cc;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .meta-item {
            padding: 10px;
            background: #f5f5f5;
            border-radius: 4px;
          }
          .meta-label {
            font-weight: bold;
            color: #555;
            font-size: 12px;
            text-transform: uppercase;
          }
          .meta-value {
            font-size: 16px;
            color: #333;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #0066cc;
            font-size: 18px;
            margin-bottom: 10px;
            border-left: 4px solid #0066cc;
            padding-left: 10px;
          }
          .description {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            line-height: 1.8;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-right: 10px;
          }
          .badge-critical { background: #ff4444; color: white; }
          .badge-high { background: #ff8800; color: white; }
          .badge-medium { background: #ffaa00; color: white; }
          .badge-low { background: #44aa44; color: white; }
          .json-block {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          footer {
            border-top: 1px solid #ddd;
            margin-top: 30px;
            padding-top: 15px;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Security Incident Report</h1>
          </header>

          <section class="meta">
            <div class="meta-item">
              <div class="meta-label">Incident ID</div>
              <div class="meta-value">${this.escapeHTML(incident.id)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Created</div>
              <div class="meta-value">${formatDate(incident.createdAt)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Type</div>
              <div class="meta-value">${this.escapeHTML(incident.incident_type.toUpperCase())}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Severity</div>
              <div class="meta-value">
                <span class="badge badge-${incident.severity}">${this.escapeHTML(incident.severity.toUpperCase())}</span>
              </div>
            </div>
          </section>

          ${incident.erste_erkenntnisse ? `
          <section class="section">
            <h2>Initial Findings</h2>
            <div class="description">${this.escapeHTML(incident.erste_erkenntnisse)}</div>
          </section>
          ` : ''}

          ${incident.metadata && Object.keys(incident.metadata).length > 0 ? `
          <section class="section">
            <h2>Metadata</h2>
            <div class="json-block">${this.escapeHTML(JSON.stringify(incident.metadata, null, 2))}</div>
          </section>
          ` : ''}

          ${incident.playbook && Object.keys(incident.playbook).length > 0 ? `
          <section class="section">
            <h2>Playbook</h2>
            <div class="json-block">${this.escapeHTML(JSON.stringify(incident.playbook, null, 2))}</div>
          </section>
          ` : ''}

          <footer>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Confidential - For Authorized Use Only</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }

  // Escape HTML to prevent injection (Node.js compatible)
  private static escapeHTML(text: string): string {
    const chars: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(text).replace(/[&<>"']/g, (char) => chars[char]);
  }

  // Close browser instance (cleanup)
  static async closeBrowser(): Promise<void> {
    if (browserInstance) {
      await browserInstance.close();
      browserInstance = null;
    }
  }
}
