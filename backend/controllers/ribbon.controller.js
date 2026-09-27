const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const ribbonService = require("../services/ribbon.service");

const list = asyncHandler(async (req, res) => {
  const includeInactive =
    req.user?.role === "admin" && req.query.includeInactive === "true";
  const data = await ribbonService.listRibbons({ includeInactive });
  return ok(res, data);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await ribbonService.getRibbonById(req.params.id);
  return ok(res, data);
});

const create = asyncHandler(async (req, res) => {
  const imagePath = req.file ? `/uploads/ribbons/${req.file.filename}` : "";
  const data = await ribbonService.createRibbon(
    {
      name: req.body.name,
      color: req.body.color,
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
    ? `/uploads/ribbons/${req.file.filename}`
    : undefined;
  const data = await ribbonService.updateRibbon(
    req.params.id,
    req.body,
    imagePath,
  );
  return ok(res, data);
});

const remove = asyncHandler(async (req, res) => {
  const data = await ribbonService.deleteRibbon(req.params.id);
  return ok(res, data);
});

module.exports = { list, getOne, create, update, remove };
