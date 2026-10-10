import mongoose, { Schema, Document } from "mongoose";

export type TopUpStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface ITopUp extends Document {
  userId: mongoose.Types.ObjectId;
  amountPaise: number;
  status: TopUpStatus;
  creditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const topUpSchema = new Schema<ITopUp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 10000,
      max: 5000000,
      validate: Number.isSafeInteger,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      required: true,
    },
    creditedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model<ITopUp>("TopUp", topUpSchema);
