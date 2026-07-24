import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  userEmail?: string;
  userRole?: "user" | "admin";
  action: string;
  description: string;
  status: "success" | "failure";
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema: Schema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    userEmail: { type: String },
    userRole: { type: String, enum: ["user", "admin"] },
    action: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true,
    },
    entityType: { type: String },
    entityId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const ActivityLogModel = mongoose.model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema
);
