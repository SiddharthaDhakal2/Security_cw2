import mongoose, { Document, Schema } from "mongoose";

export interface IPaymentTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  paymentMethod: "khalti";
  pidx?: string;
  transactionId?: string;
  amount: number;
  status: "initiated" | "paid" | "failed" | "duplicate" | "invalid";
  khaltiStatus?: string;
  failureReason?: string;
  rawResponse?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema: Schema = new Schema<IPaymentTransaction>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["khalti"],
      required: true,
    },
    pidx: { type: String },
    transactionId: { type: String },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["initiated", "paid", "failed", "duplicate", "invalid"],
      required: true,
    },
    khaltiStatus: { type: String },
    failureReason: { type: String },
    rawResponse: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const PaymentTransactionModel = mongoose.model<IPaymentTransaction>(
  "PaymentTransaction",
  PaymentTransactionSchema
);
