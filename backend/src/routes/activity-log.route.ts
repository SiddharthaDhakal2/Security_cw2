import { Router } from "express";
import { ActivityLogController } from "../controllers/activity-log.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new ActivityLogController();

router.use(requireAuth, requireAdmin);
router.get("/", controller.getLogs);

export default router;
