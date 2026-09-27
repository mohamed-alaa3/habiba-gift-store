const express = require("express");
const orderController = require("../controllers/order.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  createOrderValidator,
  updateOrderStatusValidator,
  orderIdParamValidator,
} = require("../validators/order.validator");

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", createOrderValidator, orderController.create);
router.get("/", orderController.list);
router.get("/:id/tracking", orderIdParamValidator, orderController.tracking);
router.get("/:id", orderIdParamValidator, orderController.getOne);

// Admin only
router.patch(
  "/:id/status",
  authorize("admin"),
  updateOrderStatusValidator,
  orderController.updateStatus,
);

module.exports = router;
