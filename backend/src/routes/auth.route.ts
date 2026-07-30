import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadUserImage } from "../middleware/multer.middleware";
import { createRateLimiter } from "../middleware/rate-limit.middleware";

let authController = new AuthController();
const router = Router();

const registerRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many registration attempts. Please try again later.",
});

const loginRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many login attempts. Please try again later.",
});

const mfaRateLimit = createRateLimiter({
	windowMs: 10 * 60 * 1000,
	max: 5,
	message: "Too many MFA attempts. Please try again later.",
});

const forgotPasswordRequestRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 3,
	message: "Too many password reset requests. Please try again later.",
});

const forgotPasswordVerifyRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many OTP verification attempts. Please try again later.",
});

const forgotPasswordResetRateLimit = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 3,
	message: "Too many password reset attempts. Please try again later.",
});

router.post("/register", registerRateLimit, authController.register)
router.post("/login", loginRateLimit, authController.login)
router.post("/login/mfa/verify", mfaRateLimit, authController.verifyMfaLogin)
router.post("/refresh-session", authController.refreshSession)
router.post("/logout", authController.logout)
router.put("/profile/:id", requireAuth, uploadUserImage.single("image"), authController.updateProfile)
router.put("/change-password/:id", requireAuth, authController.changePassword)
router.put("/mfa/:id", requireAuth, authController.updateMfaPreference)
router.delete("/delete-account/:id", requireAuth, authController.deleteAccount)
router.post("/forgot-password/send-otp", forgotPasswordRequestRateLimit, authController.sendOtp)
router.post("/forgot-password/verify-otp", forgotPasswordVerifyRateLimit, authController.verifyOtp)
router.post("/forgot-password/reset-password", forgotPasswordResetRateLimit, authController.resetPassword)
export default router;
