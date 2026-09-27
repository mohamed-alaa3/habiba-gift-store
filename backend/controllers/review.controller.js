const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const reviewService = require("../services/review.service");

/**
 * GET /api/products/:productId/reviews
 */
const listByProduct = asyncHandler(async (req, res) => {
  const { items, meta } = await reviewService.listProductReviews(
    req.params.productId,
    req.query,
  );
  return ok(res, items, meta);
});

/**
 * POST /api/products/:productId/reviews  (protected)
 */
const create = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const data = await reviewService.createReview(
    req.user._id,
    req.params.productId,
    {
      rating,
      comment,
    },
  );
  return ok(res, data, undefined, 201);
});

module.exports = { listByProduct, create };
