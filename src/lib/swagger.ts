import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SIAG Incident Management API',
      version: '1.0.0',
      description:
        'REST API for Swiss critical infrastructure incident management, classification, and regulatory response',
      contact: {
        name: 'SIAG',
        url: 'https://siag.ch',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
        variables: {
          protocol: {
            default: 'http',
          },
        },
      },
      {
        url: 'https://siag-incident-assistant.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication. Set in .env as API_KEY',
        },
      },
      schemas: {
        Incident: {
          type: 'object',
          required: [
            'erkennungszeitpunkt',
            'erkannt_durch',
            'betroffene_systeme',
            'incident_type',
            'severity',
          ],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique incident identifier',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when incident was created in system',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of last update',
            },
            erkennungszeitpunkt: {
              type: 'string',
              format: 'date-time',
              description: 'Time incident was discovered/detected',
            },
            erkannt_durch: {
              type: 'string',
              maxLength: 255,
              description: 'Who/what detected the incident (e.g., security team, monitoring system)',
            },
            betroffene_systeme: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of affected systems/services',
            },
            erste_erkenntnisse: {
              type: 'string',
              nullable: true,
              description: 'Initial findings/observations',
            },
            incident_type: {
              type: 'string',
              enum: ['ransomware', 'phishing', 'ddos', 'data_loss', 'other'],
              description: 'Incident classification type',
            },
            q1: {
              type: 'integer',
              minimum: 0,
              maximum: 1,
              nullable: true,
              description: 'Classification question 1 (0=no, 1=yes)',
            },
            q2: {
              type: 'integer',
              minimum: 0,
              maximum: 1,
              nullable: true,
              description: 'Classification question 2 (0=no, 1=yes)',
            },
            q3: {
              type: 'integer',
              minimum: 0,
              maximum: 1,
              nullable: true,
              description: 'Classification question 3 (0=no, 1=yes)',
            },
            severity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low'],
              description: 'Incident severity level',
            },
            playbook: {
              type: 'object',
              nullable: true,
              properties: {
                checkedSteps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      stepId: { type: 'string' },
                      checked: { type: 'boolean' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
                status: {
                  type: 'string',
                  enum: ['in_progress', 'completed'],
                },
              },
              description: 'Playbook progress tracking (JSONB)',
            },
            regulatorische_meldungen: {
              type: 'object',
              nullable: true,
              properties: {
                isg_24h: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
                dsg: { type: 'boolean' },
                finma_24h: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
                finma_72h: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
              },
              description: 'Regulatory notification deadlines (ISG, DSG, FINMA)',
            },
            metadata: {
              type: 'object',
              nullable: true,
              properties: {
                tags: { type: 'array', items: { type: 'string' } },
                notes: { type: 'string' },
                custom_fields: { type: 'object' },
              },
              description: 'Custom metadata and audit trail',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
              description: 'Field-level validation errors (from Zod)',
            },
          },
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    tags: [
      {
        name: 'Incidents',
        description: 'Incident CRUD operations',
      },
    ],
  },
  apis: ['./src/api/**/*.ts', './src/app/api/**/*.ts'], // Scan Express + App Router routes
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
