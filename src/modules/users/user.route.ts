import { Router } from "express";
import {
  getAllUsersController,
  updateUserController,
  deleteUserController,
} from "./user.controller";
import { authenticate } from "../../middlewares/auth";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { updateUserSchema, deleteUserSchema } from "./users.validation";

const router = Router();

router.get("/", authenticate, authorize("admin"), getAllUsersController);

router.put(
  "/:userId",
  authenticate,
  validate(updateUserSchema),
  updateUserController
);

router.delete(
  "/:userId",
  authenticate,
  authorize("admin"),
  validate(deleteUserSchema),
  deleteUserController
);

export const userRoutes = router;
