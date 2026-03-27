import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

/**
 * BEST APPROACH for Neon + Next.js Serverless:
 * We use neon-http (via drizzle-orm/neon-http) because it is stateless
 * and doesn't require maintaining a persistent TCP connection during
 * cold starts or between requests. This significantly reduces latency
 * and prevents "connection pooling" exhaustion errors.
 */

const sql = neon(process.env.DATABASE_URL);

// Singleton pattern to prevent multiple database instances in development
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export const db = globalForDb.db ?? drizzle(sql, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}