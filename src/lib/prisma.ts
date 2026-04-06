import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: process.env.DATABASE_URL
      ? new PrismaNeon({ connectionString: process.env.DATABASE_URL })
      : undefined,
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

// Note: Query event logging is configured via log levels above for Neon adapter compatibility
// The Neon adapter handles logging internally when query logs are enabled

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
