import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api-docs:
 *   get:
 *     summary: API Documentation
 *     description: Interactive Swagger UI for SIAG Incident API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Swagger UI HTML page
 */

export default swaggerUi.serve;

export const swaggerSetup = swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    url: '/api-docs/json',
    persistAuthorization: true,
    displayOperationId: true,
    defaultModelsExpandDepth: 1,
    docExpansion: 'list',
  },
  customSiteTitle: 'SIAG Incident API Docs',
  customCss: `
    .swagger-ui .topbar {
      background-color: #CC0033;
    }
    .swagger-ui .information .title {
      color: #CC0033;
    }
    .swagger-ui .btn-authorize {
      background-color: #CC0033;
    }
    .swagger-ui .model-box {
      background: rgba(204, 0, 51, 0.05);
      border: 1px solid #CC0033;
    }
  `,
  explorer: true,
});

/**
 * Serve OpenAPI spec as JSON at /api-docs/json
 */
export const swaggerJson = (_req: any, res: any) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
};
