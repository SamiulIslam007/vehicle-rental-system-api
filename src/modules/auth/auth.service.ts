import bcrypt from "bcryptjs";
import { pool } from "../../config/db";

const loginUserIntoDB = async (email: string, password: string) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [email]);
  const matchPassword = await bcrypt.compare(password, result.rows[0].password);

  if (!matchPassword) {
    throw new Error("Invalid credentials ! ");
  }

  return result;
};

export const authServices = {
  loginUserIntoDB,
};
