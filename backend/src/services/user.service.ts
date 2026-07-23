import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from "../config";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(409, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);

    const userObj = (newUser as any).toObject ? (newUser as any).toObject() : newUser;
    delete (userObj as any).password;

    return userObj;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    delete (userObj as any).password;

    return { token, user: userObj };
  }

  async updateProfile(requester: any, id: string, updateData: any) {
  // user can only update self unless admin
  const isAdmin = requester?.role === "admin";
  const isSelf = requester?.id === id;

  if (!isAdmin && !isSelf) throw new HttpError(403, "Forbidden");

  // Don’t allow role change from this endpoint unless admin
  if (!isAdmin) delete updateData.role;

  if (updateData.email) {
    const existingByEmail = await userRepository.getUserByEmail(updateData.email);
    if (existingByEmail && existingByEmail._id.toString() !== id) {
      throw new HttpError(409, "Email already in use");
    }
  }

  // If password present, hash it
  if (updateData.password) {
    updateData.password = await bcryptjs.hash(updateData.password, BCRYPT_SALT_ROUNDS);
  }

  const updated = await userRepository.updateUser(id, updateData);
  if (!updated) throw new HttpError(404, "User not found");

  const obj = (updated as any).toObject ? (updated as any).toObject() : updated;
  delete obj.password;

  return obj;
}

  async changePassword(requester: any, userId: string, currentPassword: string, newPassword: string) {
    // User can only change their own password
    if (requester.id !== userId) {
      throw new HttpError(403, "You can only change your own password");
    }

    // Validate new password length
    if (!newPassword || newPassword.length < 6) {
      throw new HttpError(400, "New password must be at least 6 characters");
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
    if (!newPassword || newPassword.length < 6) {
      throw new HttpError(400, "New password must be at least 6 characters");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, BCRYPT_SALT_ROUNDS);
    const updated = await userRepository.updateUser(userId, { password: hashedPassword });
    if (!updated) throw new HttpError(500, "Failed to update password");

    return { success: true, message: "Password reset successfully" };
  }

}
