/**
 * Swagger Endpoint Integration Tests
 *
 * Verifies that the Swagger UI endpoint works correctly:
 * - GET /api/swagger returns HTML with interactive Swagger UI
 * - GET /api/swagger/openapi.json returns valid OpenAPI spec JSON
 * - Content-Type and Cache-Control headers are correct
 * - HTML contains SIAG branding and CDN assets
 * - OpenAPI spec includes all endpoints and security schemes
 *
 * IMPORTANT: These tests require a running Next.js dev server at localhost:3000.
 * Run: npm run dev
 * Then: npx vitest run src/__tests__/integration/swagger.integration.test.ts
 *
 * They are intentionally skipped when no server is available (CI unit test runs).
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:3000';

/** Check if the development server is reachable before running tests */
async function isServerAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

describe('Swagger Endpoint Integration Tests', () => {
  let serverAvailable = false;

  beforeAll(async () => {
    serverAvailable = await isServerAvailable();
    if (!serverAvailable) {
      console.warn(
        '[swagger.integration] Dev server not available at localhost:3000. Skipping tests.\n' +
          '  Run `npm run dev` first to execute these integration tests.'
      );
    }
  });

  describe('GET /api/swagger', () => {
    it('should return 200 with HTML', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('swagger-ui');
      expect(html).toContain('swagger-ui-dist');
      expect(html).toContain('SwaggerUIBundle');
    });

    it('should contain Swagger UI div', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);
      const html = await response.text();

      expect(html).toContain('<div id="swagger-ui"></div>');
    });

    it('should include Swagger UI CSS from CDN', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);
      const html = await response.text();

      expect(html).toContain('swagger-ui-dist@4/swagger-ui.css');
    });

    it('should include Swagger UI JS bundles from CDN', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);
      const html = await response.text();

      expect(html).toContain('swagger-ui-dist@4/swagger-ui-bundle.js');
      expect(html).toContain('swagger-ui-dist@4/swagger-ui-standalone-preset.js');
    });

    it('should set correct Cache-Control header', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);

      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toBe('public, max-age=3600');
    });

    it('should contain SIAG branding (red color #CC0033)', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);
      const html = await response.text();

      expect(html).toContain('#CC0033');
      expect(html).toContain('background-color: #CC0033');
    });

    it('should reference the correct spec URL', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);
      const html = await response.text();

      expect(html).toContain('/api/swagger/openapi.json');
    });
  });

  describe('GET /api/swagger/openapi.json', () => {
    it('should return 200 with JSON', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger/openapi.json`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should return valid OpenAPI spec', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger/openapi.json`);
      const spec = await response.json();

      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info).toBeDefined();
      expect(spec.info.title).toContain('SIAG');
      expect(spec.paths).toBeDefined();
    });

    it('should include all incident CRUD endpoints', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger/openapi.json`);
      const spec = await response.json();

      expect(spec.paths['/api/incidents']).toBeDefined();
      expect(spec.paths['/api/incidents/{id}']).toBeDefined();
      expect(spec.paths['/api/incidents/{id}/export/json']).toBeDefined();
      expect(spec.paths['/api/incidents/{id}/export/pdf']).toBeDefined();
    });

    it('should include ApiKeyAuth security scheme', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger/openapi.json`);
      const spec = await response.json();

      expect(spec.components.securitySchemes).toBeDefined();
      expect(spec.components.securitySchemes.ApiKeyAuth).toBeDefined();
      expect(spec.components.securitySchemes.ApiKeyAuth.type).toBe('apiKey');
      expect(spec.components.securitySchemes.ApiKeyAuth.in).toBe('header');
      expect(spec.components.securitySchemes.ApiKeyAuth.name).toBe('X-API-Key');
    });

    it('should list development and production servers', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger/openapi.json`);
      const spec = await response.json();

      expect(spec.servers).toBeDefined();
      expect(spec.servers.length).toBeGreaterThanOrEqual(2);

      const serverUrls = spec.servers.map((s: { url: string }) => s.url);
      expect(serverUrls).toContain('http://localhost:3000');
      expect(serverUrls).toContain('https://siag-incident-assistant.vercel.app');
    });

    it('should set correct Cache-Control header for spec', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger/openapi.json`);

      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toBe('public, max-age=3600');
    });

    it('should include Incident schema with all required fields', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger/openapi.json`);
      const spec = await response.json();

      const incidentSchema = spec.components.schemas.Incident;
      expect(incidentSchema).toBeDefined();
      expect(incidentSchema.properties.id).toBeDefined();
      expect(incidentSchema.properties.erkennungszeitpunkt).toBeDefined();
      expect(incidentSchema.properties.incident_type).toBeDefined();
      expect(incidentSchema.properties.severity).toBeDefined();
      expect(incidentSchema.required).toContain('incident_type');
      expect(incidentSchema.required).toContain('severity');
    });
  });

  describe('Error handling', () => {
    it('should return sub-500 status for normal requests (graceful operation)', async () => {
      if (!serverAvailable) return;

      const response = await fetch(`${BASE_URL}/api/swagger`);
      expect(response.status).toBeLessThan(500);
    });
  });
});
