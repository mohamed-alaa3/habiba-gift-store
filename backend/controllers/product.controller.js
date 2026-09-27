const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const productService = require("../services/product.service");

/**
 * Build image paths array from multer files.
 */
function filesToPaths(files, folder = "products") {
  if (!files || files.length === 0) return [];
  return files.map((f) => `/uploads/${folder}/${f.filename}`);
}

/**
 * GET /api/products
 */
const list = asyncHandler(async (req, res) => {
  const includeInactive =
    req.user?.role === "admin" && req.query.includeInactive === "true";
  const { items, meta } = await productService.listProducts(req.query, {
    includeInactive,
  });
  return ok(res, items, meta);
});

/**
 * GET /api/products/:id
 * Accepts id or slug.
 */
const getOne = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === "admin";
  const data = await productService.getProductById(req.params.id, {
    includeInactive,
  });
  return ok(res, data);
});

/**
 * GET /api/products/:id/related
 */
const related = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Math.max(1, parseInt(req.query.limit, 10) || 4));
  const data = await productService.getRelatedProducts(req.params.id, limit);
  return ok(res, data);
});

/**
 * POST /api/products  (admin)
 */
const create = asyncHandler(async (req, res) => {
  const imagePaths = filesToPaths(req.files);
  const data = await productService.createProduct(req.body, imagePaths);
  return ok(res, data, undefined, 201);
});

/**
 * PATCH /api/products/:id  (admin)
 */
const update = asyncHandler(async (req, res) => {
  const newImagePaths = filesToPaths(req.files);
  const data = await productService.updateProduct(
    req.params.id,
    req.body,
    newImagePaths.length ? newImagePaths : undefined,
  );
  return ok(res, data);
});

/**
 * DELETE /api/products/:id  (admin) — soft delete
 */
const remove = asyncHandler(async (req, res) => {
  const data = await productService.deleteProduct(req.params.id);
  return ok(res, data);
});

module.exports = { list, getOne, related, create, update, remove };
