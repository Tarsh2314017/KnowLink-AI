import { Router } from "express";
import { askQuestion } from "../controllers/chat.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/ask", protect, askQuestion);

export default router;