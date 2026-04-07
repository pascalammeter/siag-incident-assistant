import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ValidationErrorResponse {
  error: string;
  details: ValidationErrorDetail[];
}

// Async handler wrapper to catch errors
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Body validation middleware
export const validateBody = (schema: ZodSchema) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: ValidationErrorDetail[] = error.issues.map((err: any) => ({
          field: err.path.join('.') || 'root',
          message: err.message,
        }));
        res.status(400).json({
          error: 'Validation failed',
          details,
        } as ValidationErrorResponse);
      } else {
        next(error);
      }
    }
  });

// Query validation middleware
export const validateQuery = (schema: ZodSchema) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: ValidationErrorDetail[] = error.issues.map((err: any) => ({
          field: err.path.join('.') || 'root',
          message: err.message,
        }));
        res.status(400).json({
          error: 'Invalid query parameters',
          details,
        } as ValidationErrorResponse);
      } else {
        next(error);
      }
    }
  });

// Global error handler (add to Express app)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: [],
  });
};
