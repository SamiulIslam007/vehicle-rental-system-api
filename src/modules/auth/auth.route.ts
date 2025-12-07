import { Router } from "express";
import { signupController, signinController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { signupSchema, signinSchema } from "./auth.validation";

const router = Router();

router.post("/signup", validate(signupSchema), signupController);
router.post("/signin", validate(signinSchema), signinController);

// export default router;

export const authRoutes = router;
