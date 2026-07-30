import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { BCRYPT_SALT_ROUNDS } from "../config";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.user.dto";
import { activityLogService } from "../services/activity-log.service";
import { PASSWORD_HISTORY_LIMIT, getPasswordExpiryDate } from "../utils/password-policy";
import { decryptSensitiveUserFields, encryptSensitiveUserFields } from "../utils/encryption";
const repo = new UserRepository();

const toSafeUser = (user: any) => {
  const obj = user?.toObject ? user.toObject() : { ...user };
  const decrypted = decryptSensitiveUserFields(obj);
  const safeUser = { ...decrypted };
  delete safeUser.password;
  delete safeUser.passwordHistory;
  delete safeUser.passwordChangedAt;
  delete safeUser.passwordExpiresAt;
  delete safeUser.resetOtp;
  delete safeUser.resetOtpExpiry;
  delete safeUser.mfaOtp;
  delete safeUser.mfaOtpExpiry;
  return safeUser;
};

export class AdminUserController {
  // POST /api/admin/users (multer)
  async createUser(req: Request, res: Response) {
    try {
      const parsed = AdminCreateUserDTO.safeParse({
        ...req.body,
        image: (req as any).file?.filename
          ? `/uploads/users/${(req as any).file.filename}`
          : undefined,
      });

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      const data: any = parsed.data;

      if (await repo.getUserByEmail(data.email)) throw new HttpError(409, "Email already in use");
      if (await repo.getUserByName(data.name)) throw new HttpError(409, "Username already in use");

      data.password = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);
      data.passwordHistory = [];
      data.passwordChangedAt = new Date();
      data.passwordExpiresAt = getPasswordExpiryDate();

      const encryptedData = encryptSensitiveUserFields(data);

      const created = await repo.createUser(encryptedData);
      const obj = toSafeUser(created);
      await activityLogService.log({
        req,
        action: "admin.user.created",
        description: `Admin created user: ${obj.email}`,
        status: "success",
        entityType: "user",
        entityId: obj._id?.toString(),
      });

      return res.status(201).json({
        success: true,
        message: "User created",
        data: obj,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /api/admin/users
  async getUsers(_req: Request, res: Response) {
    try {
      const users = await repo.getAllUsers();
      const safe = users.map(toSafeUser);

      return res.status(200).json({ success: true, data: safe });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /api/admin/users/:id
  async getUserById(req: Request, res: Response) {
    try {
      const user = await repo.getUserById(req.params.id);
      if (!user) throw new HttpError(404, "User not found");

      const obj = toSafeUser(user);

      return res.status(200).json({ success: true, data: obj });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // PUT /api/admin/users/:id (multer)
  async updateUser(req: Request, res: Response) {
    try {
      const parsed = AdminUpdateUserDTO.safeParse({
        ...req.body,
        image: (req as any).file?.filename
          ? `/uploads/users/${(req as any).file.filename}`
          : undefined,
      });

      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsed.error,
        });
      }

      const update: any = parsed.data;

      if (update.password) {
        const existing = await repo.getUserById(req.params.id);
        if (!existing) throw new HttpError(404, "User not found");

        const passwordHistory = existing.passwordHistory || [];
        const sameAsCurrent = await bcryptjs.compare(update.password, existing.password);
        const reusedRecentPassword = await Promise.all(
          passwordHistory.map((passwordHash) => bcryptjs.compare(update.password, passwordHash))
        );

        if (sameAsCurrent || reusedRecentPassword.some(Boolean)) {
          throw new HttpError(400, "New password cannot match any of the user's last 3 passwords");
        }

        update.password = await bcryptjs.hash(update.password, BCRYPT_SALT_ROUNDS);
        update.passwordHistory = [existing.password, ...passwordHistory].slice(0, PASSWORD_HISTORY_LIMIT);
        update.passwordChangedAt = new Date();
        update.passwordExpiresAt = getPasswordExpiryDate();
      }

      // If image not provided, don’t overwrite it with undefined
      if (!((req as any).file?.filename)) {
        delete update.image;
      }

      const encryptedUpdate = encryptSensitiveUserFields(update);

      const updated = await repo.updateUser(req.params.id, encryptedUpdate);
      if (!updated) throw new HttpError(404, "User not found");

      const obj = toSafeUser(updated);
      await activityLogService.log({
        req,
        action: "admin.user.updated",
        description: `Admin updated user: ${obj.email}`,
        status: "success",
        entityType: "user",
        entityId: req.params.id,
      });

      return res.status(200).json({
        success: true,
        message: "User updated",
        data: obj,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
    
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const ok = await repo.deleteUser(req.params.id);
      if (!ok) throw new HttpError(404, "User not found");
      await activityLogService.log({
        req,
        action: "admin.user.deleted",
        description: "Admin deleted user",
        status: "success",
        entityType: "user",
        entityId: req.params.id,
      });

      return res.status(200).json({ success: true, message: "User deleted" });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  
}
