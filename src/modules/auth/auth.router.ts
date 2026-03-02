import { Router } from "express";

import { validate } from "../../middleware/validate";
import { signInSchema, signUpSchema } from "./auth.schema";
import { signIn, signUp } from "./auth.controller";

const router = Router();

router.post("/sign-up", validate(signUpSchema), signUp);
router.post("/sign-in", validate(signInSchema), signIn);

export default router;
