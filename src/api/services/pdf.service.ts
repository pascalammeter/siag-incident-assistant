import { getBrowserInstance } from '../../lib/puppeteer-singleton';
import {
  generateCompletePDF,
} from '../../lib/pdf-templates';
import { Incident } from '../../lib/incident-types';

export class PDFService {
  /**
   * Generate professional PDF from incident data using Puppeteer singleton.
   * Includes title page with SIAG branding, incident details, and headers/footers.
   * Uses singleton browser instance for serverless optimization.
   */
  static async generateIncidentPDF(incident: Incident): Promise<Buffer> {
    const browser = await getBrowserInstance();
    const page = await browser.newPage();

    try {
      // Generate complete PDF HTML with title page, details, headers, and footers
      const htmlContent = generateCompletePDF(incident);

      // Render HTML to PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate PDF with proper formatting
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: 25, right: 20, bottom: 25, left: 20 }, // in mm
        printBackground: false, // Don't render backgrounds for lighter PDF and faster generation
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }


}
