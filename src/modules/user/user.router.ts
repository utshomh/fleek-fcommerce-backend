import { Router } from "express";

import { authenticate, requireAdmin } from "../../middleware/authenticate";
import { getUsers, updateUser } from "./user.controller";

const router = Router();

router.use(authenticate);

router.get("/", requireAdmin, getUsers);
router.patch("/:id", requireAdmin, updateUser);

export default router;
