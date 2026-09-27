const { body, param } = require("express-validator");
const { runValidation } = require("./_common");

const createReviewValidator = [
  param("productId").isMongoId().withMessage("Invalid product id"),

  body("rating")
    .exists()
    .withMessage("Rating is required")
    .custom((value) => {
      const n = Number(value);
      return !isNaN(n) && Number.isInteger(n) && n >= 1 && n <= 5;
    })
    .withMessage("Rating must be an integer between 1 and 5")
    .customSanitizer((value) => Number(value)),

  body("comment")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment must be at most 1000 characters"),

  runValidation,
];

const listProductReviewsValidator = [
  param("productId").isMongoId().withMessage("Invalid product id"),
  runValidation,
];

module.exports = {
  createReviewValidator,
  listProductReviewsValidator,
};
