import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Only log full stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    // Production: log structured error info only
    console.error(JSON.stringify({
      error: err.constructor.name,
      message: err.message,
      timestamp: new Date().toISOString(),
    }));
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
