import { Router } from "express";
import { createSession } from "../controllers/session.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, createSession);

export default router;