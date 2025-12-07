import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import { generateToken } from "../../utils/jwt";
import { AppError } from "../../middlewares/error";

const signupIntoDB = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  // Check if user already exists
  const checkQuery = `SELECT id FROM users WHERE email = $1`;
  const checkResult = await pool.query(checkQuery, [email as string]);

  if (checkResult.rows.length > 0) {
    throw new AppError("Email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password as string, 12);

  const query = `
    INSERT INTO users (name, email, password, phone, role)
    VALUES($1, $2, $3, $4, $5)
    RETURNING id, name, email, phone, role
  `;

  const result = await pool.query(query, [
    name,
    email,
    hashedPassword,
    phone,
    role || "customer",
  ]);

  return result.rows[0];
};

const signinFromDB = async (payload: Record<string, unknown>) => {
  const { email, password } = payload;

  const query = `
    SELECT id, name, email, password, phone, role
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email as string]);

  if (result.rows.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(
    password as string,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

export const authServices = {
  signupIntoDB,
  signinFromDB,
};
