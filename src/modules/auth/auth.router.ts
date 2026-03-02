import { Router } from "express";

import { validate } from "../../middleware/validate";
import { me, signIn, signUp } from "./auth.controller";
import { signInSchema, signUpSchema } from "./auth.schema";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post("/sign-up", validate(signUpSchema), signUp);
router.post("/sign-in", validate(signInSchema), signIn);
router.get("/me", authenticate, me);

export default router;
