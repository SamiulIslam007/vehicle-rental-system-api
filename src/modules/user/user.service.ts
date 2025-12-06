import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

const createUserIntoDB = async (payload: Record<string, unknown>) => {
  const { name, email, password, age } = payload;

  const hashedPassword = await bcrypt.hash(password as string, 12);

  const query = `
INSERT INTO users (name, age , email, password)
VALUES($1, $2, $3, $4) RETURNING * `;

  const result = await pool.query(query, [name, age, email, hashedPassword]);

  delete result.rows[0].password; // Eta korle password ta return korbe na

  return result;
};

export const userServices = {
  createUserIntoDB,
};
