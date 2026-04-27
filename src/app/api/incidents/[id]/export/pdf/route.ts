/**
 * /api/incidents/[id]/export/pdf — PDF export for incident reports
 *
 * GET /api/incidents/:id/export/pdf — Generate and download PDF report
 *
 * Requires X-API-Key header for cross-origin requests.
 * Generates professional PDF with title page, incident metadata, and headers/footers.
 * Reuses Phase 10 PDF templates (generateCompletePDF).
 */

/**
 * @swagger
 * /api/incidents/{id}/export/pdf:
 *   get:
 *     summary: Export incident as PDF report
 *     description: Generate and download a professional PDF report for the incident, including title page, metadata, and headers/footers
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique incident identifier
 *     responses:
 *       200:
 *         description: PDF file generated and ready for download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: PDF generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     x-curl-examples:
 *       - description: Export incident as PDF
 *         command: |
 *           curl -X GET http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf \
 *             -H "X-API-Key: your_api_key_here" \
 *             -o incident-report.pdf
 */

import { NextRequest } from 'next/server';
import { getBrowserInstance } from '@/lib/puppeteer-singleton';
import { generateCompletePDF } from '@/lib/pdf-templates';
import { Incident } from '@/lib/incident-types';
import { IncidentService } from '@/api/services/incident.service';
import {
  validateApiKey,
  handleOptions,
  errorResponse,
  getCorsHeaders,
} from '../../../../_helpers';

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return handleOptions();
}

// ============================================================================
// GET /api/incidents/:id/export/pdf
// ============================================================================
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    // Fetch incident from database
    const incident = await IncidentService.getIncidentById(id);
    if (!incident) {
      return errorResponse('Incident not found', 404);
    }

    // TODO: Add permission check to verify user can access this incident
    // Currently no authorization layer exists; full access assumed for API key holders
    // const hasAccess = await checkIncidentAccess(request, incident);
    // if (!hasAccess) {
    //   return errorResponse('Forbidden: No access to this incident', 403);
    // }

    let page;
    try {
      // Get browser instance (reused across invocations for performance)
      const browser = await getBrowserInstance();
      page = await browser.newPage();

      // Generate complete HTML with title page, details, headers, and footers
      const htmlContent = generateCompletePDF(incident as unknown as Incident);

      // Render HTML to PDF
      try {
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      } catch (htmlError) {
        console.error('[PDF setContent] HTML rendering failed:', htmlError);
        return errorResponse('Failed to render incident data as PDF', 500);
      }

      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await page.pdf({
          format: 'A4',
          margin: { top: 20, right: 20, bottom: 20, left: 20 },
        });
      } catch (pdfError) {
        console.error('[PDF generation] Puppeteer PDF creation failed:', pdfError);
        return errorResponse('Failed to generate PDF document', 500);
      }

      // Build filename from incident ID and creation date
      const createdDate = new Date(incident.createdAt)
        .toISOString()
        .split('T')[0];
      const contentDisposition = `attachment; filename="incident-${id}-${createdDate}.pdf"`;

      // Return binary PDF response with correct headers
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': contentDisposition,
          ...getCorsHeaders(),
        },
      });
    } finally {
      // Always close page, even if PDF generation fails
      if (page) {
        await page.close();
      }
    }
  } catch (error) {
    console.error(
      '[GET /api/incidents/:id/export/pdf] Unexpected error:',
      error
    );
    return errorResponse('Failed to generate PDF', 500);
  }
}
