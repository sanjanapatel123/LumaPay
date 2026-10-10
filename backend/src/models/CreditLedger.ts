import mongoose, { Schema, Document } from "mongoose";

export interface ICreditLedger extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amountPaise: number;
}

const creditLedgerSchema = new Schema<ICreditLedger>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "TopUp",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amountPaise: {
      type: Number,
      required: true,
      min: 10000,
      max: 5000000,
      validate: Number.isSafeInteger,
    },
  },
  { timestamps: true },
);

creditLedgerSchema.index({ orderId: 1 }, { unique: true });

export default mongoose.model<ICreditLedger>(
  "CreditLedger",
  creditLedgerSchema,
);
