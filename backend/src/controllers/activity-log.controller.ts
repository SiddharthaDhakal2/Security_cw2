import { Request, Response } from "express";
import { activityLogService } from "../services/activity-log.service";

export class ActivityLogController {
  async getLogs(_req: Request, res: Response) {
    try {
      const logs = await activityLogService.getLogs();

      return res.status(200).json({
        success: true,
        message: "Activity logs fetched",
        data: logs,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
