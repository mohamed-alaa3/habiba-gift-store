const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const wrapStyleService = require("../services/wrapStyle.service");

const list = asyncHandler(async (req, res) => {
  const includeInactive =
    req.user?.role === "admin" && req.query.includeInactive === "true";
  const data = await wrapStyleService.listWrapStyles({ includeInactive });
  return ok(res, data);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await wrapStyleService.getWrapStyleById(req.params.id);
  return ok(res, data);
});

const create = asyncHandler(async (req, res) => {
  const imagePath = req.file ? `/uploads/wrap-styles/${req.file.filename}` : "";
  const data = await wrapStyleService.createWrapStyle(
    {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      isActive: req.body.isActive,
      sortOrder: req.body.sortOrder,
    },
    imagePath,
  );
  return ok(res, data, undefined, 201);
});

const update = asyncHandler(async (req, res) => {
  const imagePath = req.file
    ? `/uploads/wrap-styles/${req.file.filename}`
    : undefined;
  const data = await wrapStyleService.updateWrapStyle(
    req.params.id,
    req.body,
    imagePath,
  );
  return ok(res, data);
});

const remove = asyncHandler(async (req, res) => {
  const data = await wrapStyleService.deleteWrapStyle(req.params.id);
  return ok(res, data);
});

module.exports = { list, getOne, create, update, remove };
