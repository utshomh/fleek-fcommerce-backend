import { Router } from "express";

import { validate } from "../../middleware/validate";
import { me, signIn, signUp, update } from "./auth.controller";
import { signInSchema, signUpSchema } from "./auth.schema";
import { authenticate } from "../../middleware/authenticate";
import upload from "../../middleware/upload";

const router = Router();

router.post("/sign-up", validate(signUpSchema), signUp);
router.post("/sign-in", validate(signInSchema), signIn);
router.patch("/update", authenticate, upload.single("photo"), update);
router.get("/me", authenticate, me);

export default router;
