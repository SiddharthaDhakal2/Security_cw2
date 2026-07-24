import { AxiosError } from "axios";
import axiosInstance from "./axios";

export interface ActivityLog {
  _id: string;
  userId?: string;
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
  createdAt: string;
  updatedAt: string;
}

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  try {
    const res = await axiosInstance.get<{ success: boolean; data: ActivityLog[] }>(
      "/api/activity-logs"
    );
    return res.data.data;
  } catch (err: unknown) {
    let message = "Failed to fetch activity logs";

    if (err instanceof AxiosError && err.response) {
      message = err.response.data?.message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    throw new Error(message);
  }
};
