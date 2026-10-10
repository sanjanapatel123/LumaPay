import { Request, Response } from "express";
import mongoose from "mongoose";
import { randomUUID, createHmac } from "crypto";
import TopUp from "../models/TopUp";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

export async function showGateway(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      res.status(400).send("Invalid order ID");
      return;
    }

    const topUp = await TopUp.findById(orderId);

    if (!topUp) {
      res.status(404).send("Order not found");
      return;
    }

    if (topUp.status !== "PENDING") {
      res.status(409).send("This payment is already final");
      return;
    }

    const amount = (topUp.amountPaise / 100).toFixed(2);
    const safeOrderId = escapeHtml(topUp._id.toString());

    res.setHeader("Cache-Control", "no-store");
    res.type("html").send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Mock Payment Gateway</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 420px;
              margin: 60px auto;
              padding: 24px;
              background: #f4f6f8;
            }
            main {
              background: white;
              padding: 28px;
              border-radius: 12px;
              box-shadow: 0 4px 20px #0001;
            }
            .amount { font-size: 30px; font-weight: bold; }
            button {
              width: 100%;
              padding: 13px;
              margin-top: 12px;
              border: 0;
              border-radius: 7px;
              cursor: pointer;
              font-size: 16px;
            }
            .pay { background: #15803d; color: white; }
            .fail { background: #dc2626; color: white; }
          </style>
        </head>
        <body>
          <main>
            <h1>Mock Payment Gateway</h1>
            <p>Order ID: ${safeOrderId}</p>
            <p>Total amount</p>
            <p class="amount">₹${amount}</p>

            <form method="POST"
              action="/mock-gateway/${safeOrderId}/pay">
              <button class="pay" type="submit">Pay</button>
            </form>

            <form method="POST"
              action="/mock-gateway/${safeOrderId}/fail">
              <button class="fail" type="submit">Fail</button>
            </form>
          </main>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Gateway page error:", error);
    res.status(500).send("Unable to load payment gateway");
  }
}

async function submitMockPayment(
  req: Request,
  res: Response,
  status: "SUCCESS" | "FAILED",
): Promise<void> {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      res.status(400).send("Invalid order ID");
      return;
    }

    const topUp = await TopUp.findById(orderId);

    if (!topUp) {
      res.status(404).send("Order not found");
      return;
    }

    if (topUp.status !== "PENDING") {
      res.status(409).send("Payment is already final");
      return;
    }

    const secret = process.env.GATEWAY_WEBHOOK_SECRET;
    if (!secret || secret.length < 32) {
      res.status(500).send("Gateway secret is not configured securely");
      return;
    }

    const event = {
      eventId: randomUUID(),
      orderId: topUp._id.toString(),
      status,
    };

    const rawBody = JSON.stringify(event);
    const signature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    // Simulate a delayed gateway webhook.
    // Redirect the browser now; send the event 5 seconds later.
    setTimeout(() => {
      void fetch(
        `http://127.0.0.1:${process.env.PORT || 5000}/webhooks/gateway`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gateway-signature": signature,
          },
          body: rawBody,
        },
      )
        .then(async (response) => {
          if (!response.ok) {
            console.error(
              "Mock webhook rejected:",
              response.status,
              await response.text(),
            );
          }
        })
        .catch((error) => {
          console.error("Mock webhook delivery failed:", error);
        });
    }, 5000);

    const frontendUrl = new URL(
      process.env.FRONTEND_URL || "http://localhost:5173",
    );
    frontendUrl.searchParams.set("topupId", topUp._id.toString());
    frontendUrl.searchParams.set("return", "1");

    res.redirect(303, frontendUrl.toString());
  } catch (error) {
    console.error("Mock payment error:", error);
    res.status(500).send("Unable to process mock payment");
  }
}

export async function payMockGateway(
  req: Request,
  res: Response,
): Promise<void> {
  await submitMockPayment(req, res, "SUCCESS");
}

export async function failMockGateway(
  req: Request,
  res: Response,
): Promise<void> {
  await submitMockPayment(req, res, "FAILED");
}
