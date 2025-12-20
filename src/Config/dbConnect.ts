import { Pool } from "pg";
import dotenv from 'dotenv'
dotenv.config();

// Create a single pool instance
const pool = new Pool({
  connectionString : process.env.DATABASE_URL
});

// Optional: test connection once
pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PG error", err);
  process.exit(1);
});

export default pool;
