import { Request, Response } from "express";
import { authServices } from "./auth.service";

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authServices.loginUserIntoDB(
      req.body.email,
      req.body.password
    );

    // User object theke password remove kora
    const { password, ...userWithoutPassword } = result.rows[0];

    return res
      .status(200)
      .json({
        message: "User loggedIn successfully",
        user: userWithoutPassword,
      });
  } catch (error: any) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const authController = {
  loginUser,
};
