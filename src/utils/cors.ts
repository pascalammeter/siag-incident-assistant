export const getCorsHeaders = () => {
  const corsOrigin = process.env.CORS_ORIGIN;

  // Fail closed in production: require explicit CORS_ORIGIN
  if (process.env.NODE_ENV === 'production' && !corsOrigin) {
    throw new Error('CORS_ORIGIN must be set in production');
  }

  return {
    'Access-Control-Allow-Origin': corsOrigin || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
};
