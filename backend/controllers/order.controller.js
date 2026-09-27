const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const orderService = require("../services/order.service");

/**
 * POST /api/orders
 */
// بعد
const create = asyncHandler(async (req, res) => {
  const { shippingAddress, notes } = req.body;
  const data = await orderService.createOrder(req.user._id, {
    shippingAddress,
    notes,
  });
  return ok(res, data, undefined, 201);
});


/**
 * GET /api/orders
 * - customers see their own
 * - admins see all
 */
const list = asyncHandler(async (req, res) => {
  const { items, meta } = await orderService.listOrders(req.user, req.query);
  return ok(res, items, meta);
});

/**
 * GET /api/orders/:id
 */
const getOne = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderById(req.user, req.params.id);
  return ok(res, data);
});

/**
 * GET /api/orders/:id/tracking
 */
const tracking = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderTracking(req.user, req.params.id);
  return ok(res, data);
});

/**
 * PATCH /api/orders/:id/status  (admin)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status,
  );
  return ok(res, data);
});

module.exports = { create, list, getOne, tracking, updateStatus };
