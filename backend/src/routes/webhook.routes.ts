import { Router } from "express";
import { processGatewayWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post("/", processGatewayWebhook);

export default router;
