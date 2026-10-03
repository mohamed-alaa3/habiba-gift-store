const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const env = require("../config/env");
const { UPLOAD } = require("../config/constants");
const ApiError = require("../utils/ApiError");

// ─── Public uploads (served statically) ─────────────────────
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

// ─── Private uploads (payment proofs) ───────────────────────
// Stored outside of the static /uploads folder and served only
// through an authenticated endpoint.
const PRIVATE_UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "private",
  "payment-proofs",
);
if (!fs.existsSync(PRIVATE_UPLOAD_DIR)) {
  fs.mkdirSync(PRIVATE_UPLOAD_DIR, { recursive: true });
}

/**
 * Build a multer disk storage for a given absolute folder.
 */
function makeStorage(absoluteDir, prefix) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, absoluteDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = crypto.randomBytes(8).toString("hex");
      cb(null, `${prefix}-${Date.now()}-${unique}${ext}`);
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
 * Create a multer instance for a public subfolder + max file count.
 */
function createUploader(subfolder, maxFiles) {
  return multer({
    storage: makeStorage(path.join(BASE_UPLOAD_DIR, subfolder), subfolder),
    fileFilter,
    limits: {
      fileSize: env.upload.maxFileSizeMB * 1024 * 1024,
      files: maxFiles,
    },
  });
}

// ============================================
// Public uploaders
// ============================================

const uploadProductImages = createUploader(
  "products",
  env.upload.maxFilesPerProduct,
).array("images", env.upload.maxFilesPerProduct);

const uploadCategoryImage = createUploader("categories", 1).single("image");
const uploadBannerImage = createUploader("banners", 1).single("image");
const uploadGiftBoxImage = createUploader("gift-boxes", 1).single("image");
const uploadWrapStyleImage = createUploader("wrap-styles", 1).single("image");
const uploadRibbonImage = createUploader("ribbons", 1).single("image");

// ============================================
// Private uploader — payment proof (single image, 5 MB max)
// ============================================

const uploadPaymentProof = multer({
  storage: makeStorage(PRIVATE_UPLOAD_DIR, "proof"),
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSizeMB * 1024 * 1024,
    files: 1,
  },
}).single("paymentProof");

module.exports = {
  uploadProductImages,
  uploadCategoryImage,
  uploadBannerImage,
  uploadGiftBoxImage,
  uploadWrapStyleImage,
  uploadRibbonImage,
  uploadPaymentProof,
  // Exported for the download endpoint in the controller
  PRIVATE_UPLOAD_DIR,
};
