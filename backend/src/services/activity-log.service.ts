import { Request } from "express";
import { ActivityLogModel } from "../models/activity-log.model";

type ActivityStatus = "success" | "failure";

interface ActivityInput {
  req?: Request;
  action: string;
  description: string;
  status?: ActivityStatus;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  actor?: {
    id?: string;
    name?: string;
    email?: string;
    role?: "user" | "admin";
  };
}

const getActor = (input: ActivityInput) => {
  const reqUser = input.req ? (input.req as any).user : undefined;
  return input.actor || reqUser || {};
};

export class ActivityLogService {
  async log(input: ActivityInput) {
    try {
      const actor = getActor(input);

      await ActivityLogModel.create({
        userId: actor.id,
        userName: actor.name,
        userEmail: actor.email,
        userRole: actor.role,
        action: input.action,
        description: input.description,
        status: input.status || "success",
        entityType: input.entityType,
        entityId: input.entityId,
        ipAddress: input.req?.ip,
        userAgent: input.req?.headers["user-agent"],
        metadata: input.metadata,
      });
    } catch (error) {
      console.error("Failed to write activity log:", error);
    }
  }

  async getLogs() {
    return ActivityLogModel.find().sort({ createdAt: -1 }).limit(300);
  }
}

export const activityLogService = new ActivityLogService();
