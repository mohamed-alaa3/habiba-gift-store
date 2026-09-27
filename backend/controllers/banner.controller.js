const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const bannerService = require("../services/banner.service");

/**
 * GET /api/banners?position=hero
 * Public (only active). Admin can pass includeInactive=true.
 */
const list = asyncHandler(async (req, res) => {
  const includeInactive =
    req.user?.role === "admin" && req.query.includeInactive === "true";

  const data = await bannerService.listBanners({
    position: req.query.position,
    includeInactive,
  });
  return ok(res, data);
});

/**
 * GET /api/banners/:id  (admin)
 */
const getOne = asyncHandler(async (req, res) => {
  const data = await bannerService.getBannerById(req.params.id);
  return ok(res, data);
});

/**
 * POST /api/banners  (admin)
 */
const create = asyncHandler(async (req, res) => {
  const imagePath = req.file ? `/uploads/banners/${req.file.filename}` : "";
  const data = await bannerService.createBanner(req.body, imagePath);
  return ok(res, data, undefined, 201);
});

/**
 * PATCH /api/banners/:id  (admin)
 */
const update = asyncHandler(async (req, res) => {
  const imagePath = req.file
    ? `/uploads/banners/${req.file.filename}`
    : undefined;
  const data = await bannerService.updateBanner(
    req.params.id,
    req.body,
    imagePath,
  );
  return ok(res, data);
});

/**
 * DELETE /api/banners/:id  (admin)
 */
const remove = asyncHandler(async (req, res) => {
  const data = await bannerService.deleteBanner(req.params.id);
  return ok(res, data);
});

module.exports = { list, getOne, create, update, remove };
