import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { BCRYPT_SALT_ROUNDS } from "../config";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.user.dto";
const repo = new UserRepository();

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

      const created = await repo.createUser(data);
      const obj = (created as any).toObject();
      delete obj.password;

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
      const safe = users.map((u: any) => {
        const obj = u.toObject();
        delete obj.password;
        return obj;
      });

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

      const obj = (user as any).toObject();
      delete obj.password;

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
        update.password = await bcryptjs.hash(update.password, BCRYPT_SALT_ROUNDS);
      }

      // If image not provided, don’t overwrite it with undefined
      if (!((req as any).file?.filename)) {
        delete update.image;
      }

      const updated = await repo.updateUser(req.params.id, update);
      if (!updated) throw new HttpError(404, "User not found");

      const obj = (updated as any).toObject();
      delete obj.password;

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

      return res.status(200).json({ success: true, message: "User deleted" });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  
}
