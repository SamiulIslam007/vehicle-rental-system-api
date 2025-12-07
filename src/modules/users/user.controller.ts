import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middlewares/auth";
import { userServices } from "./user.service";

export const getAllUsersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await userServices.getAllUsersFromDB();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string);
    const currentUserId = req.user!.id;
    const currentUserRole = req.user!.role;

    const updatedUser = await userServices.updateUserIntoDB(
      userId,
      req.body,
      currentUserId,
      currentUserRole
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string);

    await userServices.deleteUserFromDB(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
