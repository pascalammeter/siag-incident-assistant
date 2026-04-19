import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    // Test environment: Use DIRECT_URL (direct PostgreSQL endpoint) instead of pooled endpoint
    // This avoids WebSocket connection issues with Neon pooler in test environments
    // App/Prod: Use DATABASE_URL (pooled endpoint for better performance)
    const isTestEnvironment = process.env.VITEST_POOL_ID !== undefined;
    const connectionString = isTestEnvironment
      ? process.env.DIRECT_URL || process.env.DATABASE_URL
      : process.env.DATABASE_URL;

    const adapter = new PrismaNeon({
      connectionString,
    });

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  })();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
