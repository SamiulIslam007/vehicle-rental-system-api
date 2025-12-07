import { Router } from "express";
import { signupController, signinController } from "./controller";
import { validate } from "../../middlewares/validate";
import { signupSchema, signinSchema } from "./validation";

const router = Router();

router.post("/signup", signupController);
router.post("/signin", validate(signinSchema), signinController);

// export default router;

export const authRoutes = router;
