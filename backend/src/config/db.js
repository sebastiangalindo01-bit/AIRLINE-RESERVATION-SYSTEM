import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ quiet: true, override: true });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL en el archivo .env");
}

const useSsl =
    process.env.DB_SSL === "true" || process.env.DATABASE_URL.includes("supabase.co");

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false
});

export async function testDatabaseConnection() {
    const result = await pool.query("SELECT NOW() AS now");
    return result.rows[0];
}
