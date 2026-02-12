// import 'dotenv/config';
// import { drizzle } from 'drizzle-orm/neon-http';
// import { neon } from '@neondatabase/serverless';
// import * as schema from './schema';

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is not set');
// }

// const sql = neon(process.env.DATABASE_URL);
// export const db = drizzle(sql, { schema });

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// For local/Docker Postgres, we use the standard TCP connection
const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, { schema });