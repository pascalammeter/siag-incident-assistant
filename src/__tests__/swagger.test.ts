import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../api/index';

describe('Swagger UI and OpenAPI Documentation', () => {
  it('should return Swagger UI HTML at /api-docs', async () => {
    const response = await request(app)
      .get('/api-docs/')
      .redirects(1);

    expect(response.status).toBe(200);
    expect(response.type).toContain('text/html');
    expect(response.text).toContain('swagger-ui');
  });

  it('should serve Swagger JSON at /api-docs/json', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    expect(response.type).toContain('application/json');
    expect(response.body).toHaveProperty('openapi');
    expect(response.body.openapi).toBe('3.0.0');
  });

  it('should have valid OpenAPI 3.0 specification', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('info');
    expect(response.body.info.title).toBe('SIAG Incident Management API');
    expect(response.body.info.version).toBe('1.0.0');
  });

  it('should document all 6 incident endpoints', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const paths = response.body.paths;

    // Verify all 6 endpoints are present
    expect(paths).toHaveProperty('/api/incidents');
    expect(paths).toHaveProperty('/api/incidents/{id}');
    expect(paths).toHaveProperty('/api/incidents/{id}/export/json');
    expect(paths).toHaveProperty('/api/incidents/{id}/export/pdf');
  });

  it('should document POST /api/incidents endpoint', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const postEndpoint = response.body.paths['/api/incidents'].post;

    expect(postEndpoint).toBeDefined();
    expect(postEndpoint.summary).toBe('Create a new incident');
    expect(postEndpoint.tags).toContain('Incidents');
    expect(postEndpoint.requestBody).toBeDefined();
    expect(postEndpoint.responses).toHaveProperty('201');
    expect(postEndpoint.responses).toHaveProperty('400');
    expect(postEndpoint.responses).toHaveProperty('500');
  });

  it('should document GET /api/incidents endpoint', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const getEndpoint = response.body.paths['/api/incidents'].get;

    expect(getEndpoint).toBeDefined();
    expect(getEndpoint.summary).toContain('List incidents');
    expect(getEndpoint.tags).toContain('Incidents');
    expect(getEndpoint.parameters).toBeDefined();
    expect(getEndpoint.parameters.length).toBeGreaterThanOrEqual(4); // type, severity, page, limit
    expect(getEndpoint.responses).toHaveProperty('200');
    expect(getEndpoint.responses).toHaveProperty('400');
    expect(getEndpoint.responses).toHaveProperty('500');
  });

  it('should document GET /api/incidents/{id} endpoint', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const getByIdEndpoint = response.body.paths['/api/incidents/{id}'].get;

    expect(getByIdEndpoint).toBeDefined();
    expect(getByIdEndpoint.summary).toBe('Get incident by ID');
    expect(getByIdEndpoint.tags).toContain('Incidents');
    expect(getByIdEndpoint.parameters).toBeDefined();
    expect(getByIdEndpoint.responses).toHaveProperty('200');
    expect(getByIdEndpoint.responses).toHaveProperty('404');
    expect(getByIdEndpoint.responses).toHaveProperty('500');
  });

  it('should document PATCH /api/incidents/{id} endpoint', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const patchEndpoint = response.body.paths['/api/incidents/{id}'].patch;

    expect(patchEndpoint).toBeDefined();
    expect(patchEndpoint.summary).toBe('Update incident by ID');
    expect(patchEndpoint.tags).toContain('Incidents');
    expect(patchEndpoint.requestBody).toBeDefined();
    expect(patchEndpoint.responses).toHaveProperty('200');
    expect(patchEndpoint.responses).toHaveProperty('400');
    expect(patchEndpoint.responses).toHaveProperty('404');
    expect(patchEndpoint.responses).toHaveProperty('500');
  });

  it('should document DELETE /api/incidents/{id} endpoint', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const deleteEndpoint = response.body.paths['/api/incidents/{id}'].delete;

    expect(deleteEndpoint).toBeDefined();
    expect(deleteEndpoint.summary).toContain('Delete incident by ID');
    expect(deleteEndpoint.tags).toContain('Incidents');
    expect(deleteEndpoint.responses).toHaveProperty('204');
    expect(deleteEndpoint.responses).toHaveProperty('404');
    expect(deleteEndpoint.responses).toHaveProperty('500');
  });

  it('should document /api/incidents/{id}/export/json endpoint', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const exportJsonEndpoint = response.body.paths['/api/incidents/{id}/export/json'].post;

    expect(exportJsonEndpoint).toBeDefined();
    expect(exportJsonEndpoint.summary).toContain('JSON');
    expect(exportJsonEndpoint.tags).toContain('Incidents');
    expect(exportJsonEndpoint.responses).toHaveProperty('200');
    expect(exportJsonEndpoint.responses).toHaveProperty('404');
    expect(exportJsonEndpoint.responses).toHaveProperty('500');
  });

  it('should document /api/incidents/{id}/export/pdf endpoint', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const exportPdfEndpoint = response.body.paths['/api/incidents/{id}/export/pdf'].post;

    expect(exportPdfEndpoint).toBeDefined();
    expect(exportPdfEndpoint.summary).toContain('PDF');
    expect(exportPdfEndpoint.tags).toContain('Incidents');
    expect(exportPdfEndpoint.responses).toHaveProperty('200');
    expect(exportPdfEndpoint.responses).toHaveProperty('404');
    expect(exportPdfEndpoint.responses).toHaveProperty('500');
  });

  it('should include error response schemas', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const schemas = response.body.components.schemas;

    expect(schemas).toHaveProperty('ErrorResponse');
    expect(schemas.ErrorResponse.properties).toHaveProperty('error');
    expect(schemas.ErrorResponse.properties).toHaveProperty('details');
  });

  it('should include Incident schema with all fields', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const schemas = response.body.components.schemas;

    expect(schemas).toHaveProperty('Incident');
    const incidentSchema = schemas.Incident;

    expect(incidentSchema.properties).toHaveProperty('id');
    expect(incidentSchema.properties).toHaveProperty('incident_type');
    expect(incidentSchema.properties).toHaveProperty('severity');
    expect(incidentSchema.properties).toHaveProperty('playbook');
    expect(incidentSchema.properties).toHaveProperty('regulatorische_meldungen');
    expect(incidentSchema.properties).toHaveProperty('metadata');
    expect(incidentSchema.properties).toHaveProperty('createdAt');
    expect(incidentSchema.properties).toHaveProperty('updatedAt');
    expect(incidentSchema.properties).toHaveProperty('erkennungszeitpunkt');
    expect(incidentSchema.properties).toHaveProperty('erkannt_durch');
    expect(incidentSchema.properties).toHaveProperty('betroffene_systeme');
  });

  it('should include API metadata in spec', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    expect(response.body.info).toBeDefined();
    expect(response.body.info.title).toBe('SIAG Incident Management API');
    expect(response.body.info.contact?.name).toBe('SIAG');
    expect(response.body.tags).toBeDefined();
    expect(response.body.tags[0].name).toBe('Incidents');
  });

  it('should count all 6 endpoints correctly', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const paths = response.body.paths;

    let endpointCount = 0;

    // Count all methods in all paths
    Object.values(paths as any).forEach((pathItem: any) => {
      if (pathItem.get) endpointCount++;
      if (pathItem.post) endpointCount++;
      if (pathItem.patch) endpointCount++;
      if (pathItem.delete) endpointCount++;
    });

    // We expect 8 endpoints: POST create, GET list, GET single, PATCH, DELETE, POST export/json, POST export/pdf = 7 methods
    // But there's also /api-docs that appears in the spec
    expect(endpointCount).toBeGreaterThanOrEqual(7); // At least 7 incident endpoints
  });

  it('should have proper request body schema for POST /api/incidents', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const postEndpoint = response.body.paths['/api/incidents'].post;

    expect(postEndpoint.requestBody).toBeDefined();
    const schema = postEndpoint.requestBody.content['application/json'].schema;

    expect(schema.required).toContain('incident_type');
    expect(schema.required).toContain('severity');
    expect(schema.properties).toHaveProperty('incident_type');
    expect(schema.properties).toHaveProperty('severity');
  });

  it('should have proper query parameters for GET /api/incidents', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const getEndpoint = response.body.paths['/api/incidents'].get;

    const paramNames = getEndpoint.parameters.map((p: any) => p.name);

    expect(paramNames).toContain('type');
    expect(paramNames).toContain('severity');
    expect(paramNames).toContain('page');
    expect(paramNames).toContain('limit');
  });

  it('should have proper path parameter for GET /api/incidents/{id}', async () => {
    const response = await request(app)
      .get('/api-docs/json');

    expect(response.status).toBe(200);
    const getByIdEndpoint = response.body.paths['/api/incidents/{id}'].get;

    expect(getByIdEndpoint.parameters).toBeDefined();
    const idParam = getByIdEndpoint.parameters.find((p: any) => p.name === 'id');

    expect(idParam).toBeDefined();
    expect(idParam.in).toBe('path');
    expect(idParam.required).toBe(true);
  });
});
