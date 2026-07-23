import multer from "multer";
import path from "path";
import fs from "fs";


const userUploadDir = path.join(__dirname, "..", "..", "uploads", "users");
const adminUploadDir = path.join(__dirname, "..", "..", "uploads", "admin");
fs.mkdirSync(userUploadDir, { recursive: true });
fs.mkdirSync(adminUploadDir, { recursive: true });

const userStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, userUploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const adminStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, adminUploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) return cb(new Error("Only image files are allowed"));
  cb(null, true);
};

export const uploadUserImage = multer({
  storage: userStorage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadAdminImage = multer({
  storage: adminStorage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});
