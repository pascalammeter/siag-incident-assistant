import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from '../middleware/errorHandler';
import { getCorsHeaders } from '../utils/cors';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS headers
app.use((req: Request, res: Response, next: NextFunction): void => {
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

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes placeholder (to be implemented in Phase 01b and 02)
app.get('/api/incidents', async (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented — coming in Phase 02' });
});

app.post('/api/incidents', async (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented — coming in Phase 02' });
});

// Swagger UI placeholder (to be implemented in Phase 03)
app.get('/api-docs', (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Swagger UI not yet configured — coming in Phase 03' });
});

// Error handler (last middleware)
app.use(errorHandler);

// Port
const PORT = process.env.PORT || 3000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
  });
}

// For Vercel Functions (serverless)
export default app;
