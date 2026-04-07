import { timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  // Use constant-time comparison to prevent timing attacks
  const isValidKey = apiKey && expectedKey && timingSafeEqual(
    Buffer.from(String(apiKey)),
    Buffer.from(expectedKey)
  );

  if (!isValidKey) {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
    return;
  }

  next();
};
