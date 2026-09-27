const Category = require("../models/Category");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const deleteUploadedFile = require("../utils/deleteFile");
const { buildImageUrl } = require("../utils/buildImageUrl");

/**
 * Build a unique slug from the category's English or Arabic name.
 */
async function generateUniqueSlug(name) {
  const base = slugify(name?.en || name?.ar || "category", "category");
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Category.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

/**
 * Add a full URL to the image field for API consumers.
 */
function withImageUrl(category) {
  const obj = category.toJSON();
  if (obj.image) obj.imageUrl = buildImageUrl(obj.image);
  return obj;
}

/**
 * List categories with optional filters.
 */
async function listCategories({ includeInactive = false } = {}) {
  const filter = {};
  if (!includeInactive) filter.isActive = true;

  const categories = await Category.find(filter).sort({
    sortOrder: 1,
    createdAt: 1,
  });
  return categories.map(withImageUrl);
}

/**
 * Get one category by id.
 */
async function getCategoryById(id) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound("Category not found");
  return withImageUrl(category);
}

/**
 * Create a new category. Optionally receives a file path from Multer.
 */
async function createCategory({
  name,
  description,
  isActive,
  sortOrder,
  imagePath,
}) {
  const slug = await generateUniqueSlug(name);

  const category = await Category.create({
    name,
    description: description || {},
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder || 0,
    slug,
    image: imagePath || "",
  });

  return withImageUrl(category);
}

/**
 * Update an existing category.
 * If a new image is uploaded, the old one is removed from disk.
 */
async function updateCategory(
  id,
  { name, description, isActive, sortOrder, imagePath },
) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound("Category not found");

  if (name !== undefined) {
    category.name = name;
    // regenerate slug only if name changed
    category.slug = await generateUniqueSlug(name);
  }
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;

  if (imagePath) {
    // delete old image first
    if (category.image) {
      await deleteUploadedFile(category.image).catch(() => {});
    }
    category.image = imagePath;
  }

  await category.save();
  return withImageUrl(category);
}

/**
 * Delete a category.
 * Blocked if the category still has products attached.
 */
async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound("Category not found");

  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw ApiError.conflict(
      `Cannot delete category: ${productCount} product(s) still assigned to it`,
    );
  }

  if (category.image) {
    await deleteUploadedFile(category.image).catch(() => {});
  }

  await category.deleteOne();
  return { _id: id };
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
