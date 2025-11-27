import multer from "multer";
import path from "path";
import fs from "fs";

// Folder upload di ROOT PROJECT
const uploadPath = path.join(process.cwd(), "uploads");

// Buat folder kalau belum ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + ext;
    cb(null, name);
  },
});

const upload = multer({ storage });

export default upload;
