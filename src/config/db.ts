import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DATABASE_URL;

// connecting database
export const pool = new Pool({
  connectionString: DB_URL,
});

// creating tables for db
export const initDB = async () => {
  await pool.query(`
        
        CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL ,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
        
        `);

  console.log("Database Connected..");
};
