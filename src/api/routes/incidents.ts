import { Router, Request, Response } from 'express';
import { asyncHandler, validateBody } from '../middleware/validation';
import {
  CreateIncidentInputSchema,
  UpdateIncidentInputSchema,
} from '../schemas/incident.schema';
import { IncidentService } from '../services/incident.service';

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

export default router;
