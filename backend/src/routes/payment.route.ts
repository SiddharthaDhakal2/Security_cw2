import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const paymentController = new PaymentController();
const router = Router();

router.get("/admin", requireAuth, requireAdmin, paymentController.getAdminPayments);
router.post("/khalti/initiate", requireAuth, paymentController.initiateKhaltiPayment);
router.post("/khalti/retry/:orderId", requireAuth, paymentController.retryKhaltiPayment);
router.post("/khalti/verify", requireAuth, paymentController.verifyKhaltiPayment);

export default router;
