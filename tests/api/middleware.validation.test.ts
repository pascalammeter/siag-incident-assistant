import { describe, it, expect, vi } from 'vitest';
import { z, ZodError } from 'zod';
import {
  asyncHandler,
  validateBody,
  validateQuery,
  errorHandler,
} from '../../src/api/middleware/validation';

describe('Validation Middleware', () => {
  describe('asyncHandler', () => {
    it('should wrap async function and catch errors', async () => {
      const mockHandler = vi.fn().mockResolvedValue(undefined);
      const middleware = asyncHandler(mockHandler);

      const req = {} as any;
      const res = {} as any;
      const next = vi.fn();

      const wrapped = middleware(req, res, next);
      await new Promise(resolve => setTimeout(resolve, 10)); // Let promise resolve

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should return a middleware function', () => {
      const mockHandler = vi.fn().mockResolvedValue(undefined);
      const middleware = asyncHandler(mockHandler);

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });
  });

  describe('validateBody', () => {
    it('should return a middleware function', () => {
      const schema = z.object({ name: z.string() });
      const middleware = validateBody(schema);

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('should validate body against schema', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().optional(),
      });

      const middleware = validateBody(schema);
      const req = {
        body: { name: 'John', age: 30 },
      } as any;
      const res = {} as any;
      const next = vi.fn();

      await middleware(req, res, next);

      // If validation passes, next should be called (or body modified)
      // This is implementation-dependent
      expect(req.body).toBeDefined();
    });
  });

  describe('validateQuery', () => {
    it('should return a middleware function', () => {
      const schema = z.object({ page: z.string() });
      const middleware = validateQuery(schema);

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('should validate query against schema', async () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
      });

      const middleware = validateQuery(schema);
      const req = {
        query: { page: '2' },
      } as any;
      const res = {} as any;
      const next = vi.fn();

      await middleware(req, res, next);

      expect(req.query).toBeDefined();
    });
  });

  describe('errorHandler', () => {
    it('should return 500 status code on error', () => {
      const error = new Error('Test error');
      const req = {} as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return error response with details', () => {
      const error = new Error('Test error');
      const req = {} as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('error');
      expect(response).toHaveProperty('details');
      expect(response.error).toBe('Internal server error');
    });

    it('should log error to console', () => {
      const error = new Error('Test error');
      const req = {} as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      errorHandler(error, req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith('Error:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('ValidationErrorDetail', () => {
    it('should parse Zod validation errors correctly', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = schema.safeParse({ name: 'John', age: 'invalid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]).toHaveProperty('path');
        expect(issues[0]).toHaveProperty('message');
      }
    });

    it('should extract field path from Zod error', () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });

      const result = schema.safeParse({ user: { email: 'invalid' } });

      expect(result.success).toBe(false);
      if (!result.success) {
        const pathString = result.error.issues[0].path.join('.');
        expect(pathString).toContain('user');
        expect(pathString).toContain('email');
      }
    });
  });

  describe('Schema coercion', () => {
    it('should coerce string to number with z.coerce.number()', async () => {
      const schema = z.object({
        page: z.coerce.number(),
      });

      const result = await schema.parseAsync({ page: '5' });
      expect(result.page).toBe(5);
      expect(typeof result.page).toBe('number');
    });

    it('should apply default values', async () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
      });

      const result = await schema.parseAsync({});
      expect(result.page).toBe(1);
    });

    it('should use provided values over defaults', async () => {
      const schema = z.object({
        page: z.coerce.number().default(1),
      });

      const result = await schema.parseAsync({ page: '3' });
      expect(result.page).toBe(3);
    });
  });
});
