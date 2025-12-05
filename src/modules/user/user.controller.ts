import { Request, Response } from "express";
import { userServices } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.createUserIntoDB(req.body);
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
