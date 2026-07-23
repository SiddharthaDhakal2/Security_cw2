import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const orderController = new OrderController();
const router = Router();

router.post("/", requireAuth, orderController.createOrder);
router.get("/my-orders", requireAuth, orderController.getOrdersByUserId);
router.get("/status", requireAuth, requireAdmin, orderController.getOrdersByStatus);
router.get("/", requireAuth, requireAdmin, orderController.getAllOrders);
router.get("/:id", requireAuth, orderController.getOrderById);
router.patch("/:id/status", requireAuth, requireAdmin, orderController.updateOrderStatus);
router.delete("/:id", requireAuth, requireAdmin, orderController.deleteOrder);

export default router;
