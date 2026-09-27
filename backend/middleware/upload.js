const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const env = require("../config/env");
const { UPLOAD } = require("../config/constants");
const ApiError = require("../utils/ApiError");

// Ensure base upload directories exist
const BASE_UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const SUBDIRS = [
  "products",
  "categories",
  "banners",
  "gift-boxes",
  "wrap-styles",
  "ribbons",
];

for (const sub of SUBDIRS) {
  const dir = path.join(BASE_UPLOAD_DIR, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Build a multer disk storage for a given subfolder.
 */
function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(BASE_UPLOAD_DIR, subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = crypto.randomBytes(8).toString("hex");
      cb(null, `${subfolder}-${Date.now()}-${unique}${ext}`);
    },
  });
}

/**
 * Reject anything that is not an allowed image type.
 */
function fileFilter(req, file, cb) {
  if (!UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      ApiError.badRequest(
        `Invalid file type. Allowed: ${UPLOAD.ALLOWED_EXTENSIONS.join(", ")}`,
      ),
    );
  }
  return cb(null, true);
}

/**
 * Create a multer instance for a specific folder + max file count.
 */
function createUploader(subfolder, maxFiles) {
  return multer({
    storage: makeStorage(subfolder),
    fileFilter,
    limits: {
      fileSize: env.upload.maxFileSizeMB * 1024 * 1024,
      files: maxFiles,
    },
  });
}

// ============================================
// Named uploaders — MUST be defined BEFORE
// the module.exports at the bottom of the file
// ============================================

// Product: up to N images per request
const uploadProductImages = createUploader(
  "products",
  env.upload.maxFilesPerProduct,
).array("images", env.upload.maxFilesPerProduct);

// Category: single image
const uploadCategoryImage = createUploader("categories", 1).single("image");

// Banner: single image
const uploadBannerImage = createUploader("banners", 1).single("image");

// Gift Box: single image
const uploadGiftBoxImage = createUploader("gift-boxes", 1).single("image");
// Wrap Style: single image
const uploadWrapStyleImage = createUploader('wrap-styles', 1).single('image');
// Ribbon: single image
const uploadRibbonImage = createUploader('ribbons', 1).single('image');
// ============================================
// Exports (AFTER all uploaders are defined)
// ============================================

module.exports = {
  uploadProductImages,
  uploadCategoryImage,
  uploadBannerImage,
  uploadGiftBoxImage,
  uploadWrapStyleImage,
  uploadRibbonImage, 
};
