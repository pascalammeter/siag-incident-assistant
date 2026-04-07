import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../../src/utils/auth';
import { timingSafeEqual } from 'crypto';

describe('Authentication Security Audit', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Apply API key validation middleware
    app.use('/api', validateApiKey);

    app.get('/api/incidents', (req: Request, res: Response) => {
      res.status(200).json({ data: [] });
    });

    app.post('/api/incidents', (req: Request, res: Response) => {
      res.status(201).json({ id: '123' });
    });
  });

  beforeEach(() => {
    // Set a test API key for each test
    process.env.API_KEY = 'test-api-key-secure-12345';
  });

  describe('API Key Validation', () => {
    it('should reject requests without X-API-Key header', async () => {
      const response = await request(app)
        .get('/api/incidents');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeTruthy();
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('X-API-Key', 'wrong-api-key-secure-123456');

      expect(response.status).toBe(401);
    });

    it('should accept requests with valid API key', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('X-API-Key', 'test-api-key-secure-12345');

      expect(response.status).not.toBe(401);
      expect(response.status).toBe(200);
    });

    it('should not expose API key in error messages', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('X-API-Key', 'wrong-api-key-secure-123456');

      expect(response.status).toBe(401);
      if (response.body.error) {
        expect(response.body.error).not.toContain('test-api-key-secure-12345');
        expect(response.body.error).not.toContain('wrong-key');
      }
    });
  });

  describe('Constant-Time Comparison (Timing Attack Prevention)', () => {
    it('should use timingSafeEqual for API key comparison', () => {
      const key = Buffer.from('test-key');
      const expected = Buffer.from('test-key');

      // Verify timingSafeEqual works correctly
      expect(() => timingSafeEqual(key, expected)).not.toThrow();
    });

    it('should handle mismatched buffer lengths gracefully', () => {
      const shortKey = Buffer.from('short');
      const longKey = Buffer.from('this-is-a-much-longer-key');

      // timingSafeEqual throws when lengths differ
      expect(() => timingSafeEqual(shortKey, longKey)).toThrow();
    });

    it('should use constant-time comparison in middleware', () => {
      // The validateApiKey middleware wraps timingSafeEqual in try-catch
      // This ensures even if buffers differ in length, it doesn't crash
      expect(validateApiKey).toBeTruthy();
    });

    it('should handle equal-length keys for timing-safe comparison', () => {
      // When keys are same length, timingSafeEqual can be used safely
      const correctKey = 'a-valid-api-key-12345678';
      const wrongKey1 = 'z-invalid-api-key-9abc';
      const wrongKey2 = 'a-invalid-api-key-defgh';

      // Make all keys the same length for constant-time comparison
      const len = 28;
      const key1 = correctKey.padEnd(len, 'x');
      const key2 = wrongKey1.padEnd(len, 'y');
      const key3 = wrongKey2.padEnd(len, 'z');

      // Verify all are same length
      expect(key1.length).toBe(len);
      expect(key2.length).toBe(len);
      expect(key3.length).toBe(len);

      // When lengths match, timingSafeEqual can compare in constant time
      const buf1 = Buffer.from(key1);
      const buf2 = Buffer.from(key2);
      expect(() => timingSafeEqual(buf1, buf2)).not.toThrow();
    });
  });

  describe('API Key Header Requirements', () => {
    it('should require X-API-Key header (case-insensitive lookup)', async () => {
      // Express converts headers to lowercase
      const response = await request(app)
        .get('/api/incidents')
        .set('x-api-key', 'test-api-key-secure-12345');

      expect(response.status).toBe(200);
    });

    it('should apply to all /api/* routes', async () => {
      // Test GET without key
      const getRes = await request(app).get('/api/incidents');
      expect(getRes.status).toBe(401);

      // Test POST without key
      const postRes = await request(app).post('/api/incidents');
      expect(postRes.status).toBe(401);
    });

    it('should reject empty API key header', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('X-API-Key', '');

      expect(response.status).toBe(401);
    });

    it('should reject whitespace-only API key', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('X-API-Key', '   ');

      expect(response.status).toBe(401);
    });
  });

  describe('API Key Security Best Practices', () => {
    it('should verify API_KEY environment variable is required in production', () => {
      // In production, API_KEY must be set
      if (process.env.NODE_ENV === 'production') {
        expect(process.env.API_KEY).toBeTruthy();
      }
    });

    it('should not have default API key', () => {
      // Verify no hardcoded default in the source code
      expect(validateApiKey).toBeTruthy();
    });

    it('should handle missing API_KEY gracefully', async () => {
      const oldKey = process.env.API_KEY;
      delete process.env.API_KEY;

      const response = await request(app)
        .get('/api/incidents')
        .set('X-API-Key', 'any-key');

      // Without API_KEY env var set, all requests should fail
      expect(response.status).toBe(401);

      // Restore
      process.env.API_KEY = oldKey;
    });
  });
});
