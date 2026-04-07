import { timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  // Use constant-time comparison to prevent timing attacks
  let isValidKey = false;
  if (apiKey && expectedKey) {
    try {
      isValidKey = timingSafeEqual(
        Buffer.from(String(apiKey)),
        Buffer.from(expectedKey)
      );
    } catch {
      // timingSafeEqual throws when buffer lengths differ
      // Treat as invalid key (not an error)
      isValidKey = false;
    }
  }

  if (!isValidKey) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
    return;
  }

  next();
};
