// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // ajuste le nombre maximum de connexions selon tes besoins
});

export default pool;