import { Router } from "express";
import { createSource,
    getSessionSources,
    getSource,
    deleteSource,
 } from "../controllers/source.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, createSource);
router.get(
    "/session/:sessionId",
    protect,
    getSessionSources
);
router.get("/:id",protect,getSource);
router.delete("/:id",protect,deleteSource);

export default router;