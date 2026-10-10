import {
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { createHmac } from "crypto";
import { MongoMemoryReplSet } from "mongodb-memory-server";

import app from "../src/app";
import User from "../src/models/User";
import Wallet from "../src/models/Wallet";
import TopUp from "../src/models/TopUp";
import WebhookEvent from "../src/models/WebhookEvent";
import CreditLedger from "../src/models/CreditLedger";

const TEST_SECRET = "test-secret-for-webhook-signatures-123456";

let replicaSet: MongoMemoryReplSet;
let userId: mongoose.Types.ObjectId;

function makeEvent(
  orderId: string,
  eventId: string,
  status: "SUCCESS" | "FAILED",
): string {
  return JSON.stringify({ eventId, orderId, status });
}

function signBody(body: string): string {
  return createHmac("sha256", TEST_SECRET).update(body).digest("hex");
}

async function sendWebhook(body: string, signature?: string) {
  return request(app)
    .post("/webhooks/gateway")
    .set("Content-Type", "application/json")
    .set("x-gateway-signature", signature ?? signBody(body))
    .send(body);
}

async function createOrder(amountPaise = 100000) {
  const topUp = await TopUp.create({
    userId,
    amountPaise,
    status: "PENDING",
  });

  return topUp;
}

async function getBalance(): Promise<number> {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error("Test wallet not found");
  return wallet.balancePaise;
}

beforeAll(async () => {
  process.env.GATEWAY_WEBHOOK_SECRET = TEST_SECRET;

  replicaSet = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });

  await mongoose.connect(replicaSet.getUri());

  await Promise.all([
    User.init(),
    Wallet.init(),
    TopUp.init(),
    WebhookEvent.init(),
    CreditLedger.init(),
  ]);
});

afterEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Wallet.deleteMany({}),
    TopUp.deleteMany({}),
    WebhookEvent.deleteMany({}),
    CreditLedger.deleteMany({}),
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await replicaSet.stop();
});

describe("Gateway webhook", () => {
  beforeEach(async () => {
    const user = await User.create({
      name: "Test User",
      email: "webhook-test@example.com",
      passwordHash: "test-hash",
    });

    userId = user._id;

    await Wallet.create({
      userId,
      balancePaise: 0,
    });
  });

  it("credits the wallet only once for the same event", async () => {
    const order = await createOrder();
    const body = makeEvent(order.id, "event-duplicate-1", "SUCCESS");

    const first = await sendWebhook(body);
    const second = await sendWebhook(body);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(await getBalance()).toBe(100000);
    expect(await CreditLedger.countDocuments({ orderId: order._id })).toBe(1);
  });

  it("does not credit the same order twice with different event IDs", async () => {
    const order = await createOrder();

    const firstBody = makeEvent(order.id, "event-different-1", "SUCCESS");
    const secondBody = makeEvent(order.id, "event-different-2", "SUCCESS");

    expect((await sendWebhook(firstBody)).status).toBe(200);
    expect((await sendWebhook(secondBody)).status).toBe(200);

    expect(await getBalance()).toBe(100000);
    expect(await CreditLedger.countDocuments({ orderId: order._id })).toBe(1);
  });

  it("rejects an invalid HMAC signature", async () => {
    const order = await createOrder();
    const body = makeEvent(order.id, "event-invalid-signature", "SUCCESS");

    const response = await sendWebhook(body, "invalid-signature");

    expect(response.status).toBe(401);
    expect(await getBalance()).toBe(0);
    expect(await TopUp.findById(order._id).then((item) => item?.status)).toBe(
      "PENDING",
    );
  });

  it("does not credit the wallet for a FAILED payment", async () => {
    const order = await createOrder();
    const body = makeEvent(order.id, "event-failed-payment", "FAILED");

    const response = await sendWebhook(body);

    expect(response.status).toBe(200);
    expect(await getBalance()).toBe(0);
    expect(await TopUp.findById(order._id).then((item) => item?.status)).toBe(
      "FAILED",
    );
    expect(await CreditLedger.countDocuments({ orderId: order._id })).toBe(0);
  });

  it("never changes a final SUCCESS status to FAILED", async () => {
    const order = await createOrder();

    const successBody = makeEvent(order.id, "event-final-success", "SUCCESS");
    const failedBody = makeEvent(order.id, "event-late-failure", "FAILED");

    expect((await sendWebhook(successBody)).status).toBe(200);
    expect((await sendWebhook(failedBody)).status).toBe(200);

    const updatedOrder = await TopUp.findById(order._id);

    expect(updatedOrder?.status).toBe("SUCCESS");
    expect(await getBalance()).toBe(100000);
    expect(await CreditLedger.countDocuments({ orderId: order._id })).toBe(1);
  });
});
