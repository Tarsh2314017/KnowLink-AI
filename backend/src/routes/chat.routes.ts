import { Router } from "express";
import { askQuestion,
    getChatHistory,
    deleteChatHistory,
 } from "../controllers/chat.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/ask", protect, askQuestion);
router.get(
    "/:sessionId",
    protect,
    getChatHistory
);
router.delete(
    "/:sessionId",
    protect,
    deleteChatHistory
);

export default router;