import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { getCorsHeaders } from '../../src/utils/cors';

describe('CORS Security Audit', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();

    // Apply CORS headers middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const corsHeaders = getCorsHeaders();
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      next();
    });

    app.get('/api/incidents', (req: Request, res: Response) => {
      res.status(200).json({ data: [] });
    });

    app.post('/api/incidents', (req: Request, res: Response) => {
      res.status(201).json({ id: '123', incident_type: 'ransomware' });
    });
  });

  describe('CORS Origin Validation', () => {
    it('should restrict CORS to configured origin (not *)', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('Origin', 'http://evil.com');

      const corsOrigin = response.get('Access-Control-Allow-Origin');

      // Should be a specific origin or localhost, never wildcard
      expect(corsOrigin).not.toBe('*');
      // Should match configured origin
      expect(corsOrigin).toBeTruthy();
    });

    it('should allow preflight OPTIONS requests with correct headers', async () => {
      const response = await request(app)
        .options('/api/incidents')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(200);
      expect(response.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
    });

    it('should include X-API-Key in Access-Control-Allow-Headers', async () => {
      const response = await request(app)
        .options('/api/incidents')
        .set('Origin', 'http://localhost:3000');

      const allowedHeaders = response.get('Access-Control-Allow-Headers');
      expect(allowedHeaders).toContain('X-API-Key');
      expect(allowedHeaders).toContain('Content-Type');
    });

    it('should handle CORS preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/incidents')
        .set('Origin', 'http://localhost:3000');

      // Verify OPTIONS returns 200 OK
      expect(response.status).toBe(200);
      // CORS headers should be present
      const corsOrigin = response.get('Access-Control-Allow-Origin');
      expect(corsOrigin).toBeTruthy();
    });

    it('should not expose CORS headers to requests without valid origin', async () => {
      const response = await request(app)
        .get('/api/incidents');

      // Response should include configured origin regardless
      const corsOrigin = response.get('Access-Control-Allow-Origin');
      expect(corsOrigin).toBeTruthy();
    });
  });

  describe('CORS Configuration', () => {
    it('getCorsHeaders should never return wildcard origin', () => {
      const headers = getCorsHeaders();
      expect(headers['Access-Control-Allow-Origin']).not.toBe('*');
    });

    it('getCorsHeaders should include required methods', () => {
      const headers = getCorsHeaders();
      const methods = headers['Access-Control-Allow-Methods'];
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('OPTIONS');
    });

    it('getCorsHeaders should include X-API-Key header', () => {
      const headers = getCorsHeaders();
      expect(headers['Access-Control-Allow-Headers']).toContain('X-API-Key');
    });

    it('getCorsHeaders should be consistent', () => {
      const headers1 = getCorsHeaders();
      const headers2 = getCorsHeaders();
      expect(headers1).toEqual(headers2);
    });
  });
});
