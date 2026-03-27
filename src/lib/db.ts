import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

/**
 * UPDATED: Using neon-serverless (WebSocket) instead of neon-http.
 * This enables full transactional support (db.transaction) with interactivity
 * which is required for complex business logic like inventory management.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Singleton pattern to prevent multiple database instances in development
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

// Force refresh once to clear the neon-http singleton
export const db = drizzle(pool, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}