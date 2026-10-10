import { Request, Response } from "express";
import mongoose from "mongoose";
import { createHmac, timingSafeEqual } from "crypto";

import TopUp from "../models/TopUp";
import Wallet from "../models/Wallet";
import WebhookEvent from "../models/WebhookEvent";
import CreditLedger from "../models/CreditLedger";
import { emitBalanceUpdate } from "../sockets/io";

interface GatewayEvent {
  eventId: string;
  orderId: string;
  status: "SUCCESS" | "FAILED";
}

interface BalanceUpdate {
  userId: string;
  balancePaise: number;
}

function verifySignature(
  rawBody: Buffer,
  signature: string | undefined,
): boolean {
  const secret = process.env.GATEWAY_WEBHOOK_SECRET;

  if (!secret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export async function processGatewayWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  const rawBody: unknown = req.body;

  if (!Buffer.isBuffer(rawBody)) {
    res.status(400).json({
      success: false,
      message: "Expected raw webhook body",
    });
    return;
  }

  if (!verifySignature(rawBody, req.header("x-gateway-signature"))) {
    res.status(401).json({
      success: false,
      message: "Invalid webhook signature",
    });
    return;
  }

  let event: GatewayEvent;

  try {
    event = JSON.parse(rawBody.toString("utf8")) as GatewayEvent;
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid JSON",
    });
    return;
  }

  if (
    !event ||
    typeof event.eventId !== "string" ||
    !event.eventId.trim() ||
    event.eventId.length > 200 ||
    typeof event.orderId !== "string" ||
    !mongoose.isValidObjectId(event.orderId) ||
    !["SUCCESS", "FAILED"].includes(event.status)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid webhook payload",
    });
    return;
  }

  const session = await mongoose.startSession();

  try {
    const committedBalanceUpdate: BalanceUpdate | null =
      await session.withTransaction<BalanceUpdate | null>(async () => {
        // This variable belongs to this transaction attempt.
        let update: BalanceUpdate | null = null;

        const duplicate = await WebhookEvent.findOne({
          eventId: event.eventId,
        }).session(session);

        if (duplicate) {
          return null;
        }

        const topUp = await TopUp.findById(event.orderId).session(session);

        if (!topUp) {
          throw new Error("TOPUP_NOT_FOUND");
        }

        // Never change a final order status.
        if (topUp.status !== "PENDING") {
          await WebhookEvent.create(
            [
              {
                eventId: event.eventId,
                orderId: topUp._id,
                status: event.status,
                processedAt: new Date(),
              },
            ],
            { session },
          );

          return null;
        }

        if (event.status === "FAILED") {
          topUp.status = "FAILED";
          await topUp.save({ session });
        } else {
          // Unique CreditLedger.orderId prevents a second credit.
          await CreditLedger.create(
            [
              {
                orderId: topUp._id,
                userId: topUp.userId,
                amountPaise: topUp.amountPaise,
              },
            ],
            { session },
          );

          const wallet = await Wallet.findOneAndUpdate(
            { userId: topUp.userId },
            { $inc: { balancePaise: topUp.amountPaise } },
            {
              returnDocument: "after",
              session,
              runValidators: true,
            },
          );

          if (!wallet) {
            throw new Error("WALLET_NOT_FOUND");
          }

          topUp.status = "SUCCESS";
          topUp.creditedAt = new Date();

          await topUp.save({ session });

          update = {
            userId: topUp.userId.toString(),
            balancePaise: wallet.balancePaise,
          };
        }

        await WebhookEvent.create(
          [
            {
              eventId: event.eventId,
              orderId: topUp._id,
              status: event.status,
              processedAt: new Date(),
            },
          ],
          { session },
        );

        return update;
      });

    res.status(200).json({
      success: true,
      message: "Webhook processed or safely ignored",
    });

    // Emit only after the transaction has committed.
    if (committedBalanceUpdate !== null) {
      emitBalanceUpdate(
        committedBalanceUpdate.userId,
        committedBalanceUpdate.balancePaise,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message === "TOPUP_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Top-up not found",
      });
      return;
    }

    if (error instanceof Error && error.message === "WALLET_NOT_FOUND") {
      res.status(500).json({
        success: false,
        message: "Wallet not found",
      });
      return;
    }

    console.error("Webhook processing failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Webhook processing failed; retry safely",
      });
    }
  } finally {
    await session.endSession();
  }
}
