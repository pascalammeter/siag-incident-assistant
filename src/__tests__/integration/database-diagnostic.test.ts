/**
 * Database Diagnostic Test
 * Traces environment loading, Prisma initialization, and connection at each layer
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Database Diagnostics', () => {
  it('should log environment variables at test start', () => {
    console.log('\n=== ENVIRONMENT LAYER ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL (first 60 chars):', process.env.DATABASE_URL?.substring(0, 60) || 'UNSET');
    console.log('DATABASE_URL contains "neon":', process.env.DATABASE_URL?.includes('neon') ? 'YES' : 'NO');
    console.log('DATABASE_URL contains "localhost":', process.env.DATABASE_URL?.includes('localhost') ? 'YES' : 'NO');

    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL).toContain('postgresql');
  });

  it('should import prisma client without error', async () => {
    console.log('\n=== PRISMA CLIENT IMPORT ===');
    const start = Date.now();

    try {
      // Import will trigger PrismaClient creation
      const { prisma } = await import('@/api/config/prisma');
      const elapsed = Date.now() - start;

      console.log('✓ Prisma client imported successfully in', elapsed, 'ms');
      console.log('Prisma client type:', typeof prisma);
      expect(prisma).toBeDefined();
    } catch (error) {
      console.log('✗ Failed to import prisma:', error);
      throw error;
    }
  });

  it('should connect to database with simple query', async () => {
    console.log('\n=== DATABASE CONNECTION TEST ===');
    const start = Date.now();

    try {
      const { prisma } = await import('@/api/config/prisma');

      // Attempt simple connection
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      const elapsed = Date.now() - start;

      console.log('✓ Database query successful in', elapsed, 'ms');
      console.log('Query result:', result);
      expect(result).toBeDefined();
    } catch (error: any) {
      console.log('✗ Database query failed:', error.message);
      console.log('Error code:', error.code);
      console.log('Error cause:', error.cause);
      throw error;
    }
  }, 30000); // Explicit 30s timeout

  it('should verify Neon adapter is initialized', async () => {
    console.log('\n=== NEON ADAPTER CHECK ===');

    try {
      const { prisma } = await import('@/api/config/prisma');

      // Check Prisma instance
      console.log('Prisma instance exists:', !!prisma);
      console.log('Prisma._engine:', typeof prisma._engine);

      expect(prisma).toBeDefined();
    } catch (error: any) {
      console.log('✗ Prisma adapter check failed:', error.message);
      throw error;
    }
  });
});
