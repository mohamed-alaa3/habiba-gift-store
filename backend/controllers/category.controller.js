const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const categoryService = require("../services/category.service");

/**
 * GET /api/categories
 */
const list = asyncHandler(async (req, res) => {
  const includeInactive =
    req.user?.role === "admin" && req.query.includeInactive === "true";
  const data = await categoryService.listCategories({ includeInactive });
  return ok(res, data);
});

/**
 * GET /api/categories/:id
 */
const getOne = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategoryById(req.params.id);
  return ok(res, data);
});

/**
 * POST /api/categories  (admin)
 */
const create = asyncHandler(async (req, res) => {
  const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : "";
  const data = await categoryService.createCategory({
    name: req.body.name,
    description: req.body.description,
    isActive: req.body.isActive,
    sortOrder: req.body.sortOrder,
    imagePath,
  });
  return ok(res, data, undefined, 201);
});

/**
 * PATCH /api/categories/:id  (admin)
 */
const update = asyncHandler(async (req, res) => {
  const imagePath = req.file
    ? `/uploads/categories/${req.file.filename}`
    : undefined;
  const data = await categoryService.updateCategory(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    isActive: req.body.isActive,
    sortOrder: req.body.sortOrder,
    imagePath,
  });
  return ok(res, data);
});

/**
 * DELETE /api/categories/:id  (admin)
 */
const remove = asyncHandler(async (req, res) => {
  const data = await categoryService.deleteCategory(req.params.id);
  return ok(res, data);
});

module.exports = { list, getOne, create, update, remove };
