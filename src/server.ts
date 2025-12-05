import express, { Request, Response } from "express";
import { Pool } from "pg";

const app = express();
app.use(express.json()); // parse korte hoise na hole body undefined asbe

// connecting database
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_7KU9kvQjoHJi@ep-wandering-frost-a8dlarmo-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require",
});

// creating tables for db
const initDb = async () => {
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

initDb();

app.post("/users", async (req: Request, res: Response) => {
  const body = req.body;

  console.log(body);
  res.status(201).json({
    message: "User created successfully",
    user: body,
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "This is the root route of the server",
    path: "req.path",
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
