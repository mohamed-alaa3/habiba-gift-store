/**
 * Central place for shared constants across the app.
 * Controllers, validators, and services should import from here,
 * not from models, to keep a single source of truth.
 */

// --- User roles ---
const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
};

const ROLE_VALUES = Object.values(ROLES);

// --- Review statuses ---
const REVIEW_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const REVIEW_STATUS_VALUES = Object.values(REVIEW_STATUSES);

// --- Order statuses ---
const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES);

// --- Payment statuses ---
const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUSES);

// --- Payment methods ---
const PAYMENT_METHODS = {
  COD: "cod", // cash on delivery
};

const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHODS);

// --- Banner positions ---
const BANNER_POSITIONS = {
  HERO: "hero",
  PROMO: "promo",
  HOME_MID: "home-mid",
};

const BANNER_POSITION_VALUES = Object.values(BANNER_POSITIONS);

// --- Contact message statuses ---
const CONTACT_STATUSES = {
  NEW: "new",
  READ: "read",
  REPLIED: "replied",
};

const CONTACT_STATUS_VALUES = Object.values(CONTACT_STATUSES);

// --- Languages ---
const LANGUAGES = {
  EN: "en",
  AR: "ar",
};

const LANGUAGE_VALUES = Object.values(LANGUAGES);
const DEFAULT_LANGUAGE = LANGUAGES.EN;

// --- Pagination ---
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
};

// --- Uploads ---
const UPLOAD = {
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
};

module.exports = {
  ROLES,
  ROLE_VALUES,
  REVIEW_STATUSES,
  REVIEW_STATUS_VALUES,
  ORDER_STATUSES,
  ORDER_STATUS_VALUES,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_VALUES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_VALUES,
  BANNER_POSITIONS,
  BANNER_POSITION_VALUES,
  CONTACT_STATUSES,
  CONTACT_STATUS_VALUES,
  LANGUAGES,
  LANGUAGE_VALUES,
  DEFAULT_LANGUAGE,
  PAGINATION,
  UPLOAD,
};
