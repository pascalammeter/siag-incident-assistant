import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { errorHandler } from '../middleware/errorHandler';
import { getCorsHeaders } from '../utils/cors';
import { validateApiKey } from '../utils/auth';
import swaggerUi, { swaggerSetup, swaggerJson } from './swagger';
import incidentsRouter from './routes/incidents';
import { errorHandler as validationErrorHandler } from './middleware/validation';

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
// Mount incidents CRUD routes with API key validation
app.use('/api/incidents', validateApiKey, incidentsRouter);

// Error handler (last middleware)
app.use(validationErrorHandler);
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
