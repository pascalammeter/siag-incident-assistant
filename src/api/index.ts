import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from '../middleware/errorHandler';
import { getCorsHeaders } from '../utils/cors';
import swaggerUi, { swaggerSetup, swaggerJson } from './swagger';

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

// ============= SWAGGER UI (API Documentation) =============
app.use('/api-docs', swaggerUi);
app.get('/api-docs/', swaggerSetup);
app.get('/api-docs/json', swaggerJson);

// ============= API ROUTES (Phase 08) =============
// Placeholder routes (to be implemented in Phase 08)
app.get('/api/incidents', async (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented — coming in Phase 08' });
});

app.post('/api/incidents', async (_req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented — coming in Phase 08' });
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
