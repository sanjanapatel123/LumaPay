import { Request, Response } from "express";
import mongoose from "mongoose";
import TopUp from "../models/TopUp";
import Wallet from "../models/Wallet";
import { AuthRequest } from "../middleware/auth";

export async function createTopUp(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { amount } = req.body;

    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount < 10000 ||
      amount > 5000000
    ) {
      res.status(400).json({
        success: false,
        message: "Amount must be an integer between ₹100 and ₹50,000 in paise",
      });
      return;
    }

    if (!mongoose.isValidObjectId(req.userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid user",
      });
      return;
    }

    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
      return;
    }

    const topUp = await TopUp.create({
      userId: req.userId,
      amountPaise: amount,
      status: "PENDING",
    });

    const gatewayUrl =
      `http://localhost:${process.env.PORT || 5000}` +
      `/mock-gateway/${topUp._id}`;

    res.status(201).json({
      success: true,
      message: "Top-up order created",
      topUp: {
        id: topUp._id,
        amountPaise: topUp.amountPaise,
        status: topUp.status,
      },
      gatewayUrl,
    });
  } catch (error) {
    console.error("Create top-up error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create top-up",
    });
  }
}

export async function getTopUps(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const topUps = await TopUp.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select("_id amountPaise status createdAt updatedAt");

    res.json({ success: true, topUps });
  } catch (error) {
    console.error("Get top-ups error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top-ups",
    });
  }
}

export async function getTopUpById(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid top-up ID",
      });
      return;
    }

    const topUp = await TopUp.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!topUp) {
      res.status(404).json({
        success: false,
        message: "Top-up not found",
      });
      return;
    }

    res.json({
      success: true,
      topUp: {
        id: topUp._id,
        amountPaise: topUp.amountPaise,
        status: topUp.status,
        createdAt: topUp.createdAt,
      },
    });
  } catch (error) {
    console.error("Get top-up error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top-up",
    });
  }
}
