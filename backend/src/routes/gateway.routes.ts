import { Router } from "express";
import {
  showGateway,
  payMockGateway,
  failMockGateway,
} from "../controllers/gateway.controller";

const router = Router();

router.get("/:orderId", showGateway);
router.post("/:orderId/pay", payMockGateway);
router.post("/:orderId/fail", failMockGateway);

export default router;
