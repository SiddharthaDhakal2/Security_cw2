import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  category: "vegetables" | "fruits" | "grains";
  price: number;
  unit: string;
  quantity: number;
  image: string;
  supplier: string;
  farm: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["vegetables", "fruits", "grains"],
      required: true,
    },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
    supplier: { type: String, required: true },
    farm: { type: String, required: true },
    availability: {
      type: String,
      enum: ["in-stock", "low-stock", "out-of-stock"],
      default: "in-stock",
    },
  },
  {
    timestamps: true,
  }
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
