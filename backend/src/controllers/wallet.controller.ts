import { Response } from "express";
import Wallet from "../models/Wallet";
import { AuthRequest } from "../middleware/auth";

export async function getWallet(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
      return;
    }

    res.json({
      success: true,
      wallet: {
        balancePaise: wallet.balancePaise,
        balanceRupees: wallet.balancePaise / 100,
      },
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet",
    });
  }
}
