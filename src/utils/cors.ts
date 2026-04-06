export const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
});
