import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { getWallet } from "../controllers/wallet.controller";

const router = Router();

router.get("/", authenticateToken, getWallet);

export default router;
