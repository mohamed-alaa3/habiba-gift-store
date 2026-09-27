const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const deleteUploadedFile = require("../utils/deleteFile");
const { buildImageUrl, buildImageUrls } = require("../utils/buildImageUrl");

/**
 * Build a unique product slug.
 */
async function generateUniqueSlug(name) {
  const base = slugify(name?.en || name?.ar || "product", "product");
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

/**
 * Add full URLs to image paths.
 */
function withImageUrls(product) {
  const obj = product.toJSON();
  obj.imageUrls = buildImageUrls(obj.images || []);
  return obj;
}

/**
 * Compute effective price (with discount).
 */
function computeEffectivePrice(product) {
  if (
    product.discountPrice &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price
  ) {
    return product.discountPrice;
  }
  return product.price;
}

/**
 * Parse options from body (multipart sends them as JSON string).
 */
function parseOptions(rawOptions) {
  if (!rawOptions) return [];
  if (Array.isArray(rawOptions)) return rawOptions;
  try {
    const parsed =
      typeof rawOptions === "string" ? JSON.parse(rawOptions) : rawOptions;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Build a filter object from query params.
 */
function buildFilter(query, { includeInactive = false } = {}) {
  const filter = {};

  if (!includeInactive) filter.isActive = true;

  if (query.category) {
    filter.category = query.category;
  }

  if (query.featured === "true") {
    filter.isFeatured = true;
  }

  if (query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.rating) {
    filter.ratingAvg = { $gte: Number(query.rating) };
  }

  if (query.q) {
    filter.$or = [
      { "name.en": { $regex: query.q, $options: "i" } },
      { "name.ar": { $regex: query.q, $options: "i" } },
    ];
  }

  return filter;
}

/**
 * Parse sort string.
 */
function buildSort(sort) {
  const map = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    "rating-desc": { ratingAvg: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };
  return map[sort] || { createdAt: -1 };
}

/**
 * List products with filters + pagination.
 */
async function listProducts(query, { includeInactive = false } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const filter = buildFilter(query, { includeInactive });
  const sort = buildSort(query.sort);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    items: items.map(withImageUrls),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get one product by id or slug.
 */
async function getProductById(idOrSlug, { includeInactive = false } = {}) {
  const filter = mongoose.isValidObjectId(idOrSlug)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  if (!includeInactive) filter.isActive = true;

  const product = await Product.findOne(filter).populate(
    "category",
    "name slug",
  );
  if (!product) throw ApiError.notFound("Product not found");

  return withImageUrls(product);
}

/**
 * Get related products (same category, exclude self).
 */
async function getRelatedProducts(id, limit = 4) {
  const product = await Product.findById(id).select("category isActive");
  if (!product || !product.isActive)
    throw ApiError.notFound("Product not found");

  const items = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(limit)
    .sort({ createdAt: -1 });

  return items.map(withImageUrls);
}

/**
 * Create a product.
 */
async function createProduct(data, imagePaths) {
  const category = await Category.findById(data.category);
  if (!category) throw ApiError.badRequest("Category not found");

  if (!imagePaths || imagePaths.length === 0) {
    throw ApiError.badRequest("At least one product image is required");
  }

  if (data.discountPrice != null && data.discountPrice >= data.price) {
    throw ApiError.badRequest(
      "Discount price must be less than the regular price",
    );
  }

  const slug = await generateUniqueSlug(data.name);

  const product = await Product.create({
    ...data,
    slug,
    images: imagePaths,
    options: parseOptions(data.options),
  });

  return withImageUrls(product);
}

/**
 * Update a product.
 * If new images uploaded, replace the full set (and delete old files).
 */
async function updateProduct(id, data, newImagePaths) {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Product not found");

  if (data.category) {
    const category = await Category.findById(data.category);
    if (!category) throw ApiError.badRequest("Category not found");
    product.category = data.category;
  }

  if (data.name !== undefined) {
    product.name = data.name;
    product.slug = await generateUniqueSlug(data.name);
  }

  if (data.description !== undefined) product.description = data.description;
  if (data.shortDescription !== undefined)
    product.shortDescription = data.shortDescription;
  if (data.price !== undefined) product.price = data.price;
  if (data.discountPrice !== undefined)
    product.discountPrice = data.discountPrice;
  if (data.stock !== undefined) product.stock = data.stock;
  if (data.sku !== undefined) product.sku = data.sku;
  if (data.isFeatured !== undefined) product.isFeatured = data.isFeatured;
  if (data.isActive !== undefined) product.isActive = data.isActive;
  if (data.options !== undefined) product.options = parseOptions(data.options);

  // Re-validate discount after price changes
  if (product.discountPrice != null && product.discountPrice >= product.price) {
    throw ApiError.badRequest(
      "Discount price must be less than the regular price",
    );
  }

  // Replace images if new ones uploaded
  if (newImagePaths && newImagePaths.length > 0) {
    const oldImages = product.images || [];
    product.images = newImagePaths;
    // delete old files best-effort
    for (const img of oldImages) {
      // eslint-disable-next-line no-await-in-loop
      await deleteUploadedFile(img).catch(() => {});
    }
  }

  await product.save();
  return withImageUrls(product);
}

/**
 * Soft delete: mark inactive.
 */
async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Product not found");

  product.isActive = false;
  await product.save();

  return { _id: id, isActive: false };
}

module.exports = {
  listProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  computeEffectivePrice,
};
