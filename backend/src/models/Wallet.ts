import mongoose, { Document, Schema } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balancePaise: number;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balancePaise: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Wallet balance must be an integer number of paise",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IWallet>("Wallet", walletSchema);
