import { Request, Response, NextFunction } from 'express';

export const formatErrorResponse = (message: string, details?: any) => ({
  error: message,
  ...(details && { details }),
});

export const formatSuccessResponse = <T>(data: T) => ({
  data,
});

export const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
