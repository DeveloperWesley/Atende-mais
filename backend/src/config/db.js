import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query(text, params) {
  const startedAt = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - startedAt;

  if (process.env.NODE_ENV !== "production" && duration > 500) {
    console.warn("Slow query", { duration, text });
  }

  return result;
}
