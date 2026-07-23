import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadUserImage } from "../middleware/multer.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();
const controller = new AdminUserController();

router.use(requireAuth, requireAdmin);

router.post("/users", uploadUserImage.single("image"), controller.createUser);
router.get("/users", controller.getUsers);
router.get("/users/:id", controller.getUserById);
router.put("/users/:id", uploadUserImage.single("image"), controller.updateUser);
router.delete("/users/:id", controller.deleteUser);


export default router;
