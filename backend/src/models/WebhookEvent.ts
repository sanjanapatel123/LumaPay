import mongoose, { Schema, Document } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string;
  orderId: mongoose.Types.ObjectId;
  status: "SUCCESS" | "FAILED";
  processedAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: {
      type: String,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "TopUp",
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

webhookEventSchema.index({ eventId: 1 }, { unique: true });

export default mongoose.model<IWebhookEvent>(
  "WebhookEvent",
  webhookEventSchema,
);
