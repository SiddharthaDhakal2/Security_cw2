import mongoose, { Document, Schema } from "mongoose";

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod?: "khalti" | "esewa";
  paymentStatus: "unpaid" | "paid" | "failed";
  paymentPidx?: string;
  paymentReference?: string;
  paidAt?: Date;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema<OrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["khalti", "esewa"],
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
    paymentPidx: { type: String },
    paymentReference: { type: String },
    paidAt: { type: Date },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
