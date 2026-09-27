const WrapStyle = require("../models/WrapStyle");
const ApiError = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const deleteUploadedFile = require("../utils/deleteFile");
const { buildImageUrl } = require("../utils/buildImageUrl");

async function generateUniqueSlug(name) {
  const base = slugify(name?.en || name?.ar || "wrap-style", "wrap-style");
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await WrapStyle.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function withImageUrl(style) {
  const obj = style.toJSON();
  if (obj.image) obj.imageUrl = buildImageUrl(obj.image);
  return obj;
}

async function listWrapStyles({ includeInactive = false } = {}) {
  const filter = {};
  if (!includeInactive) filter.isActive = true;

  const styles = await WrapStyle.find(filter).sort({
    sortOrder: 1,
    createdAt: 1,
  });
  return styles.map(withImageUrl);
}

async function getWrapStyleById(id) {
  const style = await WrapStyle.findById(id);
  if (!style) throw ApiError.notFound("Wrap style not found");
  return withImageUrl(style);
}

async function createWrapStyle(data, imagePath) {
  const slug = await generateUniqueSlug(data.name);

  const style = await WrapStyle.create({
    name: data.name,
    description: data.description || {},
    slug,
    image: imagePath || "",
    price: data.price,
    isActive: data.isActive !== undefined ? data.isActive : true,
    sortOrder: data.sortOrder || 0,
  });

  return withImageUrl(style);
}

async function updateWrapStyle(id, data, imagePath) {
  const style = await WrapStyle.findById(id);
  if (!style) throw ApiError.notFound("Wrap style not found");

  if (data.name !== undefined) {
    style.name = data.name;
    style.slug = await generateUniqueSlug(data.name);
  }
  if (data.description !== undefined) style.description = data.description;
  if (data.price !== undefined) style.price = data.price;
  if (data.isActive !== undefined) style.isActive = data.isActive;
  if (data.sortOrder !== undefined) style.sortOrder = data.sortOrder;

  if (imagePath) {
    if (style.image) await deleteUploadedFile(style.image).catch(() => {});
    style.image = imagePath;
  }

  await style.save();
  return withImageUrl(style);
}

async function deleteWrapStyle(id) {
  const style = await WrapStyle.findById(id);
  if (!style) throw ApiError.notFound("Wrap style not found");

  if (style.image) await deleteUploadedFile(style.image).catch(() => {});

  await style.deleteOne();
  return { _id: id };
}

module.exports = {
  listWrapStyles,
  getWrapStyleById,
  createWrapStyle,
  updateWrapStyle,
  deleteWrapStyle,
};
