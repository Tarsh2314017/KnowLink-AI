import { Router } from "express";
import { createSession,
         getSessions,
         getSession,
         updateSession,
         deleteSession,
        } from "../controllers/session.controller";

import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, createSession);
router.get("/",protect,getSessions);
router.get("/:id",protect,getSession);
router.patch("/:id",protect,updateSession);
router.delete("/:id",protect,deleteSession);

export default router;