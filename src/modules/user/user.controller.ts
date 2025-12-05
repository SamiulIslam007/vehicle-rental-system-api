import { Request, Response } from "express";
import { pool } from "../../config/db";

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const result = await pool.query(
      `
INSERT INTO users (name, email, password)
VALUES($1, $2, $3) RETURNING * `,
      [name, email, password]
    );
    console.log(result);
    return res
      .status(201)
      .json({ message: "User created successfully", user: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const userController = {
  createUser,
};
