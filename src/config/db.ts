import { Pool } from "pg";

// connecting database
export const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_7KU9kvQjoHJi@ep-wandering-frost-a8dlarmo-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require",
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
