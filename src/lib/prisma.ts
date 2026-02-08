import { PrismaClient } from "../generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors and warnings in development to reduce console noise
    // Set PRISMA_LOG_QUERIES=true in .env if you need to see all queries
    log: process.env.NODE_ENV === "development" 
      ? (process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "error", "warn"] : ["error", "warn"])
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Note: Prisma client models are available at runtime
// If you see errors about missing models, run: npx prisma generate
// Then restart the development server 