import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadUserImage } from "../middleware/multer.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.put("/profile/:id", requireAuth, uploadUserImage.single("image"), authController.updateProfile)
router.put("/change-password/:id", requireAuth, authController.changePassword)
router.delete("/delete-account/:id", requireAuth, authController.deleteAccount)
router.post("/forgot-password/send-otp", authController.sendOtp)
router.post("/forgot-password/verify-otp", authController.verifyOtp)
router.post("/forgot-password/reset-password", authController.resetPassword)
export default router;
