const { body, param } = require("express-validator");
const { runValidation } = require("./_common");
const { ORDER_STATUS_VALUES } = require("../config/constants");

const createOrderValidator = [
  // Shipping address snapshot — all required except a few optional
  body("shippingAddress")
    .exists()
    .withMessage("Shipping address is required")
    .custom((v) => v && typeof v === "object")
    .withMessage("Shipping address must be an object"),

  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Shipping address fullName is required")
    .isLength({ max: 80 })
    .withMessage("Shipping address fullName is too long"),

  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Shipping address phone is required")
    .isLength({ max: 20 })
    .withMessage("Shipping address phone is too long"),

  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Shipping address country is required"),

  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("Shipping address city is required"),

  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Shipping address street is required"),

  body("shippingAddress.area").optional({ checkFalsy: true }).trim(),
  body("shippingAddress.building").optional({ checkFalsy: true }).trim(),
  body("shippingAddress.apartment").optional({ checkFalsy: true }).trim(),
  body("shippingAddress.postalCode").optional({ checkFalsy: true }).trim(),

  body("notes")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be at most 500 characters"),
  body("giftBox")
    .optional()
    .custom((v) => v === null || typeof v === "object")
    .withMessage("giftBox must be an object or null"),

  body("giftBox.boxId")
    .optional()
    .isMongoId()
    .withMessage("giftBox.boxId must be a valid id"),

  body("giftBox.items")
    .optional()
    .isArray()
    .withMessage("giftBox.items must be an array"),

  body("giftBox.wrapStyleId")
    .optional()
    .isMongoId()
    .withMessage("giftBox.wrapStyleId must be a valid id"),

  body("giftBox.ribbonId")
    .optional()
    .isMongoId()
    .withMessage("giftBox.ribbonId must be a valid id"),

  body("giftBox.note")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("giftBox.note must be at most 500 characters"),

  runValidation,
];

const updateOrderStatusValidator = [
  param("id").isMongoId().withMessage("Invalid order id"),

  body("status")
    .exists()
    .withMessage("Status is required")
    .isIn(ORDER_STATUS_VALUES)
    .withMessage(`Status must be one of: ${ORDER_STATUS_VALUES.join(", ")}`),

  runValidation,
];

const orderIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid order id"),
  runValidation,
];

module.exports = {
  createOrderValidator,
  updateOrderStatusValidator,
  orderIdParamValidator,
};
