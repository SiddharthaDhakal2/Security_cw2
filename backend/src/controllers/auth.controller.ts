import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, MfaPreferenceDTO, MfaVerifyDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { activityLogService } from "../services/activity-log.service";

const userService = new UserService();
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const strongPasswordMessage =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol";

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error.message);
    console.error("Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env file");
  } else {
    console.log("Email service is ready");
  }
});

// Generate OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOtpEmail(email: string, otp: string, purpose = "Password Reset"): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your ${purpose} OTP`,
    html: `
      <h2>${purpose} Request</h2>
      <p>Your OTP is:</p>
      <h1 style="color: #22863a; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP is valid for a short time.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      
      console.log("REGISTER CT:", req.headers["content-type"]);
      console.log("REGISTER BODY:", req.body);

      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const newUser = await userService.createUser(parsedData.data);
      await activityLogService.log({
        req,
        action: "user.register",
        description: `User registered: ${newUser.email}`,
        status: "success",
        entityType: "user",
        entityId: newUser._id?.toString(),
        actor: {
          id: newUser._id?.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      
      console.log("LOGIN CT:", req.headers["content-type"]);
      console.log("LOGIN BODY:", req.body);

      const parsedData = LoginUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const loginResult = await userService.loginUser(parsedData.data);

      if (loginResult.mfaRequired) {
        await sendOtpEmail(loginResult.email!, loginResult.otp!, "Login Verification");
        await activityLogService.log({
          req,
          action: "auth.login.mfa_required",
          description: `MFA OTP sent for login: ${loginResult.email}`,
          status: "success",
          entityType: "user",
          actor: {
            email: loginResult.email,
          },
        });

        return res.status(200).json({
          success: true,
          message: "MFA OTP sent to your email",
          mfaRequired: true,
          email: loginResult.email,
        });
      }

      await activityLogService.log({
        req,
        action: "auth.login.success",
        description: `User logged in: ${loginResult.user?.email}`,
        status: "success",
        entityType: "user",
        entityId: loginResult.user?._id?.toString(),
        actor: {
          id: loginResult.user?._id?.toString(),
          name: loginResult.user?.name,
          email: loginResult.user?.email,
          role: loginResult.user?.role,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        mfaRequired: false,
        token: loginResult.token,
        data: loginResult.user,
      });
    } catch (error: any) {
      await activityLogService.log({
        req,
        action: "auth.login.failed",
        description: `Login failed for ${req.body?.email || "unknown email"}: ${error.message || "Unknown error"}`,
        status: "failure",
        entityType: "user",
        actor: {
          email: req.body?.email,
        },
      });
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async verifyMfaLogin(req: Request, res: Response) {
    try {
      const parsedData = MfaVerifyDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const { token, user } = await userService.verifyMfaLogin(
        parsedData.data.email,
        parsedData.data.otp
      );
      await activityLogService.log({
        req,
        action: "auth.login.mfa_verified",
        description: `MFA login completed: ${user.email}`,
        status: "success",
        entityType: "user",
        entityId: user._id?.toString(),
        actor: {
          id: user._id?.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateMfaPreference(req: Request, res: Response) {
    try {
      const parsedData = MfaPreferenceDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const updated = await userService.updateMfaPreference(
        (req as any).user,
        req.params.id,
        parsedData.data.enabled,
        parsedData.data.currentPassword
      );
      await activityLogService.log({
        req,
        action: parsedData.data.enabled ? "auth.mfa.enabled" : "auth.mfa.disabled",
        description: parsedData.data.enabled ? "User enabled MFA" : "User disabled MFA",
        status: "success",
        entityType: "user",
        entityId: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: parsedData.data.enabled ? "MFA enabled" : "MFA disabled",
        data: updated,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
  try {
    const requester = (req as any).user;

    const update: any = { ...req.body };

    if ((req as any).file?.filename) {
      update.image = `/uploads/users/${(req as any).file.filename}`;
    }

    const updated = await userService.updateProfile(requester, req.params.id, update);
    await activityLogService.log({
      req,
      action: "user.profile.updated",
      description: `Profile updated for ${updated.email}`,
      status: "success",
      entityType: "user",
      entityId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: updated,
    });
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

  async changePassword(req: Request, res: Response) {
    try {
      const requester = (req as any).user;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      const result = await userService.changePassword(
        requester,
        req.params.id,
        currentPassword,
        newPassword
      );
      await activityLogService.log({
        req,
        action: "user.password.changed",
        description: "User changed password",
        status: "success",
        entityType: "user",
        entityId: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      const requester = (req as any).user;
      const { currentPassword } = req.body;

      if (!currentPassword || !currentPassword.toString().trim()) {
        return res.status(400).json({
          success: false,
          message: "Current password is required",
        });
      }

      const result = await userService.deleteOwnAccount(
        requester,
        req.params.id,
        currentPassword
      );
      await activityLogService.log({
        req,
        action: "user.account.deleted",
        description: "User deleted own account",
        status: "success",
        entityType: "user",
        entityId: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await userService.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

      await userService.updateUser(user._id.toString(), {
        resetOtp: otp,
        resetOtpExpiry: otpExpiry,
      });

      await sendOtpEmail(email, otp);
      await activityLogService.log({
        req,
        action: "auth.password_reset.otp_sent",
        description: `Password reset OTP sent: ${email}`,
        status: "success",
        entityType: "user",
        actor: { email },
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
        });
      }

      const user = await userService.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.resetOtp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      if (!user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired",
        });
      }

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword, confirmPassword } = req.body;

      if (!email || !otp || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, OTP, new password, and confirm password are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }

      if (!strongPasswordPattern.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: strongPasswordMessage,
        });
      }

      const user = await userService.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.resetOtp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      if (!user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired",
        });
      }

      const result = await userService.updatePassword(user._id.toString(), newPassword);

      // Clear OTP after successful password reset
      await userService.updateUser(user._id.toString(), {
        resetOtp: null,
        resetOtpExpiry: null,
      });
      await activityLogService.log({
        req,
        action: "auth.password_reset.completed",
        description: `Password reset completed: ${email}`,
        status: "success",
        entityType: "user",
        entityId: user._id.toString(),
        actor: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }


}
