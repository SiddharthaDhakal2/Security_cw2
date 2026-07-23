import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import nodemailer from "nodemailer";

const userService = new UserService();

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
async function sendOtpEmail(email: string, otp: string): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Password Reset OTP",
    html: `
      <h2>Password Reset Request</h2>
      <p>Your OTP for password reset is:</p>
      <h1 style="color: #22863a; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP is valid for 2 minutes.</p>
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

      const { token, user } = await userService.loginUser(parsedData.data);

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

  async updateProfile(req: Request, res: Response) {
  try {
    const requester = (req as any).user;

    const update: any = { ...req.body };

    if ((req as any).file?.filename) {
      update.image = `/uploads/users/${(req as any).file.filename}`;
    }

    const updated = await userService.updateProfile(requester, req.params.id, update);

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

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
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
