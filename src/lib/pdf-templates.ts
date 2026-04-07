import { Incident } from '@/lib/incident-types';

/**
 * Generate professional title page HTML for incident PDF.
 * Includes SIAG logo, incident ID, creation date, type, and severity.
 * This page will have no headers/footers via CSS @page:first rule.
 */
export function generateTitlePageHTML(incident: Incident): string {
  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const incidentTypeLabel = incident.incident_type
    ? incident.incident_type
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Unknown';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; color: #333; }
          .title-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 40px;
            text-align: center;
            page-break-after: always;
          }
          .logo { width: 120px; height: 120px; margin-bottom: 40px; }
          h1 { font-size: 48px; font-weight: 700; margin-bottom: 20px; color: #CC0033; }
          .incident-type { font-size: 24px; color: #666; margin-bottom: 40px; }
          .metadata { font-size: 14px; color: #999; line-height: 1.8; }
          .metadata-row { margin: 10px 0; }
          .label { font-weight: 600; color: #333; }
        </style>
      </head>
      <body>
        <div class="title-page">
          <!-- SIAG Logo (SVG) -->
          <svg class="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#CC0033" rx="10" />
            <text x="50" y="70" font-size="60" font-weight="bold" fill="white" text-anchor="middle">S</text>
          </svg>

          <h1>Incident Report</h1>
          <div class="incident-type">${incidentTypeLabel}</div>

          <div class="metadata">
            <div class="metadata-row">
              <span class="label">Incident ID:</span> ${incident.id}
            </div>
            <div class="metadata-row">
              <span class="label">Date Created:</span> ${formattedDate}
            </div>
            <div class="metadata-row">
              <span class="label">Severity:</span> ${incident.severity?.toUpperCase() || 'UNKNOWN'}
            </div>
            ${incident.erkennungszeitpunkt ? `
              <div class="metadata-row">
                <span class="label">Incident Detected:</span>
                ${new Date(incident.erkennungszeitpunkt).toLocaleString()}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate incident details HTML page with playbook, metadata, and affected systems.
 * Includes h2 headers with CSS borders and proper spacing for page breaks.
 */
export function generateIncidentDetailsHTML(incident: Incident): string {
  const playbook = incident.playbook || {};
  const playbookItems = typeof playbook === 'string' ? JSON.parse(playbook) : playbook;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; color: #333; font-size: 12pt; line-height: 1.6; }
          h1 { font-size: 24pt; margin-top: 20px; margin-bottom: 10px; color: #003B5E; }
          h2 { font-size: 16pt; margin-top: 15px; margin-bottom: 8px; color: #333; border-bottom: 2px solid #CC0033; padding-bottom: 4px; }
          h3 { font-size: 13pt; margin-top: 10px; margin-bottom: 6px; color: #555; }
          p { margin-bottom: 8px; }
          .section { margin-bottom: 20px; page-break-inside: avoid; }
          .checklist { margin-left: 20px; }
          .checklist-item { margin-bottom: 6px; }
          .checklist-item input { margin-right: 8px; }
          .checked { text-decoration: line-through; opacity: 0.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: 600; }
          .label { font-weight: 600; color: #333; }
          .page-break { page-break-after: always; }
          .no-break { page-break-inside: avoid; }
          ul { margin-left: 20px; }
          li { margin-bottom: 4px; }
          pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 10pt;
          }
        </style>
      </head>
      <body>
        <h1>Incident Details</h1>

        <div class="section no-break">
          <h2>Recognition & Discovery</h2>
          ${incident.erkennungszeitpunkt ? `
            <p><span class="label">Time Detected:</span> ${new Date(incident.erkennungszeitpunkt).toLocaleString()}</p>
          ` : ''}
          ${incident.erkannt_durch ? `
            <p><span class="label">Detected By:</span> ${incident.erkannt_durch}</p>
          ` : ''}
          ${incident.betroffene_systeme && incident.betroffene_systeme.length > 0 ? `
            <p><span class="label">Affected Systems:</span></p>
            <ul>
              ${incident.betroffene_systeme.map(system => `<li>${system}</li>`).join('')}
            </ul>
          ` : ''}
          ${incident.erste_erkenntnisse ? `
            <p><span class="label">Initial Findings:</span></p>
            <p>${incident.erste_erkenntnisse}</p>
          ` : ''}
        </div>

        <div class="section no-break">
          <h2>Classification</h2>
          <p><span class="label">Incident Type:</span> ${incident.incident_type || 'Unknown'}</p>
          <p><span class="label">Severity:</span> ${(incident.severity || 'Unknown').toUpperCase()}</p>
        </div>

        ${incident.playbook ? `
          <div class="section">
            <h2>Playbook Checklist</h2>
            <div class="checklist">
              ${Object.entries(playbookItems).map(([key, value]: [string, any]) => `
                <div class="checklist-item ${value?.completed ? 'checked' : ''}">
                  <input type="checkbox" ${value?.completed ? 'checked' : ''} disabled />
                  <span>${value?.title || key}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${incident.regulatorische_meldungen ? `
          <div class="section no-break">
            <h2>Regulatory Notifications</h2>
            <pre>${JSON.stringify(incident.regulatorische_meldungen, null, 2)}</pre>
          </div>
        ` : ''}

        ${incident.metadata ? `
          <div class="section no-break">
            <h2>Additional Metadata</h2>
            <pre>${JSON.stringify(incident.metadata, null, 2)}</pre>
          </div>
        ` : ''}
      </body>
    </html>
  `;
}

/**
 * Generate combined PDF HTML with title page, incident details, headers and footers.
 * Uses CSS @page rules to render professional headers on all pages except the title page.
 * Headers show: Incident ID (left) and Date (right)
 * Footers show: Page numbers ("Page X of Y")
 */
export function generateCompletePDF(incident: Incident): string {
  const titlePage = generateTitlePageHTML(incident);
  const details = generateIncidentDetailsHTML(incident);
  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Extract body content from both templates
  const titleMatch = titlePage.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  const detailsMatch = details.match(/<body[^>]*>([\s\S]*?)<\/body>/);

  const titleContent = titleMatch ? titleMatch[1] : '';
  const detailsContent = detailsMatch ? detailsMatch[1] : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; color: #333; font-size: 12pt; }

          /* Page setup */
          @page {
            size: A4;
            margin: 25mm 20mm;
          }

          /* Header on all pages (default) */
          @page {
            @top-center {
              content: "Incident #${incident.id}                                     ${formattedDate}";
              font-size: 10pt;
              color: #666;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
          }

          /* Footer on all pages (default) */
          @page {
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 10pt;
              color: #666;
              padding-top: 10px;
              border-top: 1px solid #ddd;
            }
          }

          /* First page (title) - no header/footer */
          @page :first {
            @top-center { content: none; }
            @bottom-center { content: none; }
            margin: 0;
          }

          @media print { body { margin: 0; padding: 0; } }

          .title-page { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 40px; text-align: center; page-break-after: always; }
          .logo { width: 120px; height: 120px; margin-bottom: 40px; }
          h1 { font-size: 48px; font-weight: 700; margin-bottom: 20px; color: #CC0033; }
          .incident-type { font-size: 24px; color: #666; margin-bottom: 40px; }
          .metadata { font-size: 14px; color: #999; line-height: 1.8; }
          .metadata-row { margin: 10px 0; }
          .label { font-weight: 600; color: #333; }
          h2 { font-size: 16pt; margin-top: 15px; margin-bottom: 8px; color: #333; border-bottom: 2px solid #CC0033; padding-bottom: 4px; }
          .section { margin-bottom: 20px; page-break-inside: avoid; }
          .no-break { page-break-inside: avoid; }
          .page-break { page-break-after: always; }
          ul { margin-left: 20px; }
          li { margin-bottom: 4px; }
          pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 10pt;
          }
          .checklist-item input { margin-right: 8px; }
          .checked { text-decoration: line-through; opacity: 0.6; }
        </style>
      </head>
      <body>
        ${titleContent}
        ${detailsContent}
      </body>
    </html>
  `;
}

/**
 * Generate HTML for PDF headers and footers (legacy function for reference).
 * Note: Headers and footers are now integrated into generateCompletePDF via CSS @page rules.
 */
export function generateHeaderFooterHTML(incident: Incident): string {
  const formattedDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; font-size: 10pt; color: #666; }

          .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
            font-size: 10pt;
            color: #666;
          }

          .pdf-header-left { flex: 1; }
          .pdf-header-right { flex: 1; text-align: right; }

          .pdf-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 0;
            border-top: 1px solid #ddd;
            font-size: 10pt;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <div class="pdf-header-left">Incident #${incident.id}</div>
          <div class="pdf-header-right">${formattedDate}</div>
        </div>

        <div class="pdf-footer">
          Page <span class="page-number"></span>
        </div>
      </body>
    </html>
  `;
}
