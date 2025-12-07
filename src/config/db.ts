import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const DB_URL = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: DB_URL,
});

export const initDB = async () => {
  console.log("Database Connected....");
};
