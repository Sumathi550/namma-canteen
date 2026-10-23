const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/images/food");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Additional target paths to sync with frontend & staff-portal during development
const syncDirs = [
  path.join(__dirname, "../../frontend/public/images/food"),
  path.join(__dirname, "../../staff-portal/public/images/food"),
];

function syncFileToPublicDirs(sourcePath, filename) {
  for (const dir of syncDirs) {
    try {
      if (fs.existsSync(dir)) {
        const destPath = path.join(dir, filename);
        fs.copyFileSync(sourcePath, destPath);
      }
    } catch (err) {
      console.warn(`Could not sync uploaded image to ${dir}:`, err.message);
    }
  }
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e5);
    const finalName = `food_${cleanName}_${uniqueSuffix}${ext}`;
    cb(null, finalName);
  },
});

// Allowed file extensions and mimetypes
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|jfif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtValid = allowedExtensions.test(ext.replace(".", ""));
  const isMimeValid = file.mimetype.startsWith("image/");

  if (isExtValid || isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WEBP, GIF, JFIF) are supported."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max file size
  fileFilter,
});

module.exports = {
  upload,
  uploadDir,
  syncFileToPublicDirs,
};
