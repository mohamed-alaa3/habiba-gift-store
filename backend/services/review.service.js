const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

/**
 * Recompute ratingAvg + ratingCount for a product from its approved reviews.
 * Called after any create/update/delete of a review.
 */
async function recalcProductRating(productId) {
  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$product",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        ratingAvg: Math.round(avg * 10) / 10, // keep 1 decimal
        ratingCount: count,
      },
    },
  );
}

/**
 * List reviews for a product.
 * Public — returns approved reviews only.
 * Sorted newest-first, with basic pagination.
 */
async function listProductReviews(productId, query = {}) {
  const productExists = await Product.exists({ _id: productId });
  if (!productExists) throw ApiError.notFound("Product not found");

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { product: productId, status: "approved" };

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Create a review for a product.
 * - User must not have already reviewed this product.
 * - Product must exist and be active.
 * - After saving, recalc product rating.
 */
async function createReview(userId, productId, { rating, comment }) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw ApiError.notFound("Product not found");
  }

  const existing = await Review.findOne({ user: userId, product: productId });
  if (existing) {
    throw ApiError.conflict("You have already reviewed this product");
  }

  const review = await Review.create({
    user: userId,
    product: productId,
    rating,
    comment: comment || "",
    // V1: auto-approve so ratings update immediately.
    // If moderation is needed later, change to 'pending'.
    status: "approved",
  });

  await recalcProductRating(productId);

  // Return with user name populated
  const populated = await review.populate("user", "name");
  return populated;
}

module.exports = {
  listProductReviews,
  createReview,
  recalcProductRating,
};
