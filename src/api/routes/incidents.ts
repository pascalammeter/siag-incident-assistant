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
 *     tags: [Incidents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [incident_type, severity]
 *             properties:
 *               incident_type:
 *                 type: string
 *                 enum: [ransomware, phishing, ddos, data_loss, other]
 *               severity:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *               description:
 *                 type: string
 *               playbook:
 *                 type: object
 *               regulatorische_meldungen:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Incident created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
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
 *     tags: [Incidents]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ransomware, phishing, ddos, data_loss, other]
 *         description: Filter by incident type
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low]
 *         description: Filter by severity
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of incidents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
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
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Incident retrieved successfully
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error
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
 *     summary: Update incident by ID
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               incident_type:
 *                 type: string
 *               severity:
 *                 type: string
 *               description:
 *                 type: string
 *               playbook:
 *                 type: object
 *               regulatorische_meldungen:
 *                 type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Incident updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error
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
 *     summary: Delete incident by ID (soft delete)
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Incident deleted successfully
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error
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
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: JSON file download
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error
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
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Incident not found
 *       500:
 *         description: Server error
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
