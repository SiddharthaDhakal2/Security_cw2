import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from "../config";

const userRepository = new UserRepository();
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;
const MFA_OTP_MINUTES = 5;

const toPublicUser = (user: any) => {
  const userObj = user?.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.resetOtp;
  delete userObj.resetOtpExpiry;
  delete userObj.mfaOtp;
  delete userObj.mfaOtpExpiry;
  delete userObj.failedLoginAttempts;
  delete userObj.lockedUntil;
  delete userObj.lastFailedLoginAt;
  return userObj;
};

const isStrongPassword = (password: string) =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(409, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);

    return toPublicUser(newUser);
  }

  private createToken(user: any) {
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpError(
        423,
        `Account locked. Try again after ${user.lockedUntil.toLocaleString()}`
      );
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      const failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

      await userRepository.updateUser(user._id.toString(), {
        failedLoginAttempts,
        lastFailedLoginAt: new Date(),
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null,
      } as any);

      if (shouldLock) {
        throw new HttpError(
          423,
          `Too many failed login attempts. Account locked for ${LOCKOUT_MINUTES} minutes`
        );
      }

      throw new HttpError(401, "Invalid credentials");
    }

    await userRepository.updateUser(user._id.toString(), {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLoginAt: null,
    } as any);

    if (user.mfaEnabled) {
      const otp = this.generateOtp();
      await userRepository.updateUser(user._id.toString(), {
        mfaOtp: otp,
        mfaOtpExpiry: new Date(Date.now() + MFA_OTP_MINUTES * 60 * 1000),
      } as any);

      return {
        mfaRequired: true,
        otp,
        email: user.email,
        message: "MFA OTP required",
      };
    }

    return { token: this.createToken(user), user: toPublicUser(user), mfaRequired: false };
  }

  async verifyMfaLogin(email: string, otp: string) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    if (!user.mfaEnabled) {
      throw new HttpError(400, "MFA is not enabled for this account");
    }

    if (user.mfaOtp !== otp) {
      throw new HttpError(400, "Invalid OTP");
    }

    if (!user.mfaOtpExpiry || new Date() > user.mfaOtpExpiry) {
      throw new HttpError(400, "OTP has expired");
    }

    await userRepository.updateUser(user._id.toString(), {
      mfaOtp: null,
      mfaOtpExpiry: null,
    } as any);

    return { token: this.createToken(user), user: toPublicUser(user) };
  }

  async updateMfaPreference(requester: any, userId: string, enabled: boolean, currentPassword: string) {
    if (requester.id !== userId) {
      throw new HttpError(403, "You can only update MFA for your own account");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new HttpError(400, "Current password is incorrect");
    }

    const updated = await userRepository.updateUser(userId, {
      mfaEnabled: enabled,
      mfaOtp: null,
      mfaOtpExpiry: null,
    } as any);
    if (!updated) throw new HttpError(500, "Failed to update MFA preference");

    return toPublicUser(updated);
  }

  async updateProfile(requester: any, id: string, updateData: any) {
  // user can only update self unless admin
  const isAdmin = requester?.role === "admin";
  const isSelf = requester?.id === id;

  if (!isAdmin && !isSelf) throw new HttpError(403, "Forbidden");

  const allowedProfileFields = [
    "name",
    "email",
    "firstName",
    "lastName",
    "phone",
    "address",
    "image",
  ];

  if (isAdmin) {
    allowedProfileFields.push("role");
  }

  updateData = Object.fromEntries(
    Object.entries(updateData).filter(([key]) => allowedProfileFields.includes(key))
  );

  // Don’t allow role change from this endpoint unless admin
  if (!isAdmin) delete updateData.role;

  if (updateData.email) {
    const existingByEmail = await userRepository.getUserByEmail(updateData.email);
    if (existingByEmail && existingByEmail._id.toString() !== id) {
      throw new HttpError(409, "Email already in use");
    }
  }

  const updated = await userRepository.updateUser(id, updateData);
  if (!updated) throw new HttpError(404, "User not found");

  return toPublicUser(updated);
}

  async changePassword(requester: any, userId: string, currentPassword: string, newPassword: string) {
    // User can only change their own password
    if (requester.id !== userId) {
      throw new HttpError(403, "You can only change your own password");
    }

    // Validate new password length
    if (!newPassword || !isStrongPassword(newPassword)) {
      throw new HttpError(
        400,
        "New password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      );
    }

    // Get user from database
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Verify current password
    const validPassword = await bcryptjs.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new HttpError(400, "Current password is incorrect");
    }

    // Check that new password is different from current
    const sameAsOld = await bcryptjs.compare(newPassword, user.password);
    if (sameAsOld) {
      throw new HttpError(400, "New password must be different from current password");
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // Update password
    const updated = await userRepository.updateUser(userId, { password: hashedPassword });
    if (!updated) throw new HttpError(500, "Failed to update password");

    return { success: true, message: "Password updated successfully" };
  }

  async deleteOwnAccount(
    requester: any,
    userId: string,
    currentPassword: string
  ) {
    // User can only delete their own account.
    if (requester.id !== userId) {
      throw new HttpError(403, "You can only delete your own account");
    }

    if (!currentPassword || !currentPassword.trim()) {
      throw new HttpError(400, "Current password is required");
    }

    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new HttpError(400, "Current password is incorrect");
    }

    const deleted = await userRepository.deleteUser(userId);
    if (!deleted) {
      throw new HttpError(500, "Failed to delete account");
    }

    return { success: true, message: "Account deleted successfully" };
  }

  async findByEmail(email: string) {
    const user = await userRepository.getUserByEmail(email);
    return user;
  }

  async updateUser(userId: string, updateData: any) {
    const updated = await userRepository.updateUser(userId, updateData);
    if (!updated) throw new HttpError(404, "User not found");
    return updated;
  }

  async updatePassword(userId: string, newPassword: string) {
    if (!newPassword || !isStrongPassword(newPassword)) {
      throw new HttpError(
        400,
        "New password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      );
    }

    const hashedPassword = await bcryptjs.hash(newPassword, BCRYPT_SALT_ROUNDS);
    const updated = await userRepository.updateUser(userId, { password: hashedPassword });
    if (!updated) throw new HttpError(500, "Failed to update password");

    return { success: true, message: "Password reset successfully" };
  }

}
