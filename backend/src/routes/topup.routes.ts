import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createTopUp,
  getTopUps,
  getTopUpById,
} from "../controllers/topup.controller";

const router = Router();

router.use(authenticateToken);

router.post("/", createTopUp);
router.get("/", getTopUps);
router.get("/:id", getTopUpById);

export default router;
