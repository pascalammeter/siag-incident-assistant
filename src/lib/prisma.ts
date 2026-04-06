import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ]
      : [
          { level: 'error', emit: 'event' },
        ],
  });

// Development: Log all queries and timing
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    console.log(`[${new Date().toISOString()}] Query took ${e.duration}ms`);
    console.log(`  ${e.query}`);
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
