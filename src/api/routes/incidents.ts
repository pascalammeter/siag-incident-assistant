import { Router, Request, Response } from 'express';
import { asyncHandler, validateBody, validateQuery } from '../middleware/validation';
import {
  CreateIncidentInputSchema,
  UpdateIncidentInputSchema,
  ListIncidentsQuerySchema,
} from '../schemas/incident.schema';
import { IncidentService } from '../services/incident.service';
import { PDFService } from '../services/pdf.service';
import { setDownloadHeaders, generateFileName } from '../../utils/fileDownload';

const router = Router();

/**
 * @swagger
 * /api/incidents:
 *   post:
 *     summary: Create a new incident
 *     description: Create a new security incident with mandatory type and severity classification
 *     tags: [Incidents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIncidentRequest'
 *           examples:
 *             ransomware:
 *               summary: Ransomware incident example
 *               value:
 *                 incident_type: ransomware
 *                 severity: critical
 *                 erkennungszeitpunkt: "2026-04-07T14:30:00Z"
 *                 erkannt_durch: "SOC monitoring alert"
 *                 betroffene_systeme: ["Exchange", "SharePoint", "File Server"]
 *                 erste_erkenntnisse: "Detected encrypted files with .locked extension on multiple systems"
 *             phishing:
 *               summary: Phishing incident example
 *               value:
 *                 incident_type: phishing
 *                 severity: high
 *                 erkennungszeitpunkt: "2026-04-07T10:00:00Z"
 *                 erkannt_durch: "User reported suspicious email"
 *                 betroffene_systeme: ["Email"]
 *                 erste_erkenntnisse: "Email from support@company-clone.com requesting password reset"
 *             ddos:
 *               summary: DDoS incident example
 *               value:
 *                 incident_type: ddos
 *                 severity: medium
 *                 erkennungszeitpunkt: "2026-04-07T09:15:00Z"
 *                 erkannt_durch: "Automated WAF alert"
 *                 betroffene_systeme: ["Web API", "Load Balancer"]
 *                 erste_erkenntnisse: "High volume traffic from multiple IPs exceeding normal baseline"
 *     responses:
 *       201:
 *         description: Incident created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Validation error (invalid type, severity, or missing required fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (invalid or missing API key)
 *       500:
 *         description: Server error (database unavailable, PDF generation failed)
 *     x-curl-examples:
 *       - description: Create ransomware incident
 *         command: |
 *           curl -X POST http://localhost:3000/api/incidents \
 *             -H "Content-Type: application/json" \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -d '{
 *               "incident_type": "ransomware",
 *               "severity": "critical",
 *               "erkennungszeitpunkt": "2026-04-07T14:30:00Z",
 *               "erkannt_durch": "SOC monitoring",
 *               "betroffene_systeme": ["Exchange", "SharePoint"]
 *             }'
 */
router.post(
  '/',
  validateBody(CreateIncidentInputSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const incident = await IncidentService.createIncident(req.body);
    res.status(201).json(incident);
  })
);

/**
 * @swagger
 * /api/incidents:
 *   get:
 *     summary: List incidents with filtering and pagination
 *     description: Retrieve incidents with optional filtering by type and severity, with configurable pagination
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ransomware, phishing, ddos, data_loss, other]
 *         description: Filter by incident type (optional)
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low]
 *         description: Filter by severity level (optional)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination (1-indexed, default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page (default 10, max 100)
 *     responses:
 *       200:
 *         description: List of incidents with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 *                 total:
 *                   type: integer
 *                   description: Total number of incidents matching filters
 *                 page:
 *                   type: integer
 *                   description: Current page number
 *                 limit:
 *                   type: integer
 *                   description: Items per page
 *             example:
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   incident_type: "ransomware"
 *                   severity: "critical"
 *                   createdAt: "2026-04-07T14:30:00.000Z"
 *                   erkennungszeitpunkt: "2026-04-07T14:30:00.000Z"
 *                   betroffene_systeme: ["Exchange", "SharePoint"]
 *               total: 42
 *               page: 1
 *               limit: 10
 *       400:
 *         description: Invalid query parameters (page/limit out of bounds)
 *       401:
 *         description: Unauthorized (invalid or missing API key)
 *       500:
 *         description: Server error (database unavailable)
 *     x-curl-examples:
 *       - description: List all incidents
 *         command: |
 *           curl "http://localhost:3000/api/incidents" \
 *             -H "X-API-Key: sk_test_abc123..."
 *       - description: List critical incidents
 *         command: |
 *           curl "http://localhost:3000/api/incidents?severity=critical" \
 *             -H "X-API-Key: sk_test_abc123..."
 *       - description: List ransomware incidents, page 2
 *         command: |
 *           curl "http://localhost:3000/api/incidents?type=ransomware&page=2&limit=20" \
 *             -H "X-API-Key: sk_test_abc123..."
 */
router.get(
  '/',
  validateQuery(ListIncidentsQuerySchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { type, severity, page, limit } = req.query as any;

    const result = await IncidentService.listIncidents(
      { type, severity },
      { page, limit }
    );

    res.status(200).json(result);
  })
);

/**
 * @swagger
 * /api/incidents/{id}:
 *   get:
 *     summary: Get incident by ID
 *     description: Retrieve a specific incident by its UUID
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident UUID identifier
 *     responses:
 *       200:
 *         description: Incident retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       401:
 *         description: Unauthorized (invalid or missing API key)
 *       404:
 *         description: Incident not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error (database unavailable)
 *     x-curl-examples:
 *       - description: Get incident details
 *         command: |
 *           curl "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
 *             -H "X-API-Key: sk_test_abc123..."
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      res.status(404).json({
        error: 'Incident not found',
        details: [],
      });
      return;
    }

    res.status(200).json(incident);
  })
);

/**
 * @swagger
 * /api/incidents/{id}:
 *   patch:
 *     summary: Update incident (partial update)
 *     description: Update one or more fields of an incident. All fields are optional.
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident UUID identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any incident fields to update (all optional)
 *           examples:
 *             updateSeverity:
 *               summary: Update severity only
 *               value:
 *                 severity: "high"
 *             updatePlaybook:
 *               summary: Update playbook progress
 *               value:
 *                 playbook:
 *                   checkedSteps:
 *                     - stepId: "ransomware_01_isolate"
 *                       checked: true
 *                       timestamp: "2026-04-07T14:45:00Z"
 *                   status: "in_progress"
 *             updateMultiple:
 *               summary: Update multiple fields
 *               value:
 *                 severity: "medium"
 *                 betroffene_systeme: ["Exchange", "File Server"]
 *                 metadata:
 *                   tags: ["external", "in-investigation"]
 *     responses:
 *       200:
 *         description: Incident updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Validation error (invalid field values)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized (invalid or missing API key)
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error
 *     x-curl-examples:
 *       - description: Update severity
 *         command: |
 *           curl -X PATCH "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
 *             -H "Content-Type: application/json" \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -d '{"severity": "medium"}'
 *       - description: Update playbook progress
 *         command: |
 *           curl -X PATCH "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
 *             -H "Content-Type: application/json" \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -d '{
 *               "playbook": {
 *                 "checkedSteps": [
 *                   {"stepId": "ransomware_01_isolate", "checked": true, "timestamp": "2026-04-07T14:45:00Z"}
 *                 ],
 *                 "status": "in_progress"
 *               }
 *             }'
 */
router.patch(
  '/:id',
  validateBody(UpdateIncidentInputSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const incident = await IncidentService.updateIncident(id, req.body);

    if (!incident) {
      res.status(404).json({
        error: 'Incident not found',
        details: [],
      });
      return;
    }

    res.status(200).json(incident);
  })
);

/**
 * @swagger
 * /api/incidents/{id}:
 *   delete:
 *     summary: Delete incident (soft delete)
 *     description: Soft-delete an incident. The incident is marked as deleted (deletedAt set) but retained in database for audit purposes. Can be recovered.
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident UUID identifier
 *     responses:
 *       204:
 *         description: Incident deleted successfully (no body)
 *       401:
 *         description: Unauthorized (invalid or missing API key)
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error
 *     x-curl-examples:
 *       - description: Delete an incident
 *         command: |
 *           curl -X DELETE "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000" \
 *             -H "X-API-Key: sk_test_abc123..."
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const deleted = await IncidentService.deleteIncident(id);

    if (!deleted) {
      res.status(404).json({
        error: 'Incident not found',
        details: [],
      });
      return;
    }

    res.status(204).send();
  })
);

/**
 * @swagger
 * /api/incidents/{id}/export/json:
 *   post:
 *     summary: Export incident as JSON file
 *     description: Download incident data as a JSON file (application/json). Useful for data backup or external processing.
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident UUID identifier
 *     responses:
 *       200:
 *         description: JSON file download successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Incident'
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               incident_type: "ransomware"
 *               severity: "critical"
 *               createdAt: "2026-04-07T14:30:00.000Z"
 *               updatedAt: "2026-04-07T14:30:00.000Z"
 *               erkennungszeitpunkt: "2026-04-07T14:30:00.000Z"
 *       401:
 *         description: Unauthorized (invalid or missing API key)
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error (JSON generation failed)
 *     x-curl-examples:
 *       - description: Export incident as JSON
 *         command: |
 *           curl -X POST "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/json" \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -o incident_550e8400.json
 */
router.post(
  '/:id/export/json',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      res.status(404).json({
        error: 'Incident not found',
        details: [],
      });
      return;
    }

    const filename = generateFileName(id, 'json');
    setDownloadHeaders(res, {
      filename,
      mimeType: 'application/json',
    });

    res.send(JSON.stringify(incident, null, 2));
  })
);

/**
 * @swagger
 * /api/incidents/{id}/export/pdf:
 *   post:
 *     summary: Export incident as PDF file
 *     description: Generate and download a professional PDF report of the incident. Includes incident details, classification, playbook checklist, and regulatory deadlines. Processing time ~2-5 seconds per document.
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident UUID identifier
 *     responses:
 *       200:
 *         description: PDF file download successful
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *             example: "%PDF-1.4 ... [binary PDF content] ... %%EOF"
 *       401:
 *         description: Unauthorized (invalid or missing API key)
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error (Puppeteer PDF generation failed)
 *     x-curl-examples:
 *       - description: Export incident as PDF
 *         command: |
 *           curl -X POST "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf" \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -o incident_550e8400.pdf
 *       - description: Export and open PDF in browser (macOS)
 *         command: |
 *           curl -X POST "http://localhost:3000/api/incidents/550e8400-e29b-41d4-a716-446655440000/export/pdf" \
 *             -H "X-API-Key: sk_test_abc123..." \
 *             -o incident.pdf && open incident.pdf
 */
router.post(
  '/:id/export/pdf',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      res.status(404).json({
        error: 'Incident not found',
        details: [],
      });
      return;
    }

    try {
      const pdfBuffer = await PDFService.generateIncidentPDF(incident);

      const filename = generateFileName(id, 'pdf');
      setDownloadHeaders(res, {
        filename,
        mimeType: 'application/pdf',
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({
        error: 'Failed to generate PDF',
        details: [],
      });
    }
  })
);

export default router;
