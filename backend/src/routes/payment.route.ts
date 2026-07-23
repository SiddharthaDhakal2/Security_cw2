import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { requireAuth } from "../middleware/auth.middleware";

const paymentController = new PaymentController();
const router = Router();

router.post("/khalti/initiate", requireAuth, paymentController.initiateKhaltiPayment);
router.post("/khalti/verify", requireAuth, paymentController.verifyKhaltiPayment);

export default router;
