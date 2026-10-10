import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import topUpRoutes from "./routes/topup.routes";
import walletRoutes from "./routes/wallet.routes";
import gatewayRoutes from "./routes/gateway.routes";
import webhookRoutes from "./routes/webhook.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);

app.use(
  "/webhooks/gateway",
  express.raw({ type: "application/json", limit: "10kb" }),
  webhookRoutes,
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "JSTACK Wallet API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/topups", topUpRoutes);
app.use("/wallet", walletRoutes);
app.use("/mock-gateway", gatewayRoutes);

export default app;
