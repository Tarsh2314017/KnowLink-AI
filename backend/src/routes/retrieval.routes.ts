import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { testRetrieval } from "../controllers/retrieval.controller";

const router = Router();

router.post("/test", protect, testRetrieval);

export default router;