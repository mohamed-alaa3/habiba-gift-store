const Ribbon = require("../models/Ribbon");
const ApiError = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const deleteUploadedFile = require("../utils/deleteFile");
const { buildImageUrl } = require("../utils/buildImageUrl");

async function generateUniqueSlug(name) {
  const base = slugify(name?.en || name?.ar || "ribbon", "ribbon");
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Ribbon.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function withImageUrl(ribbon) {
  const obj = ribbon.toJSON();
  if (obj.image) obj.imageUrl = buildImageUrl(obj.image);
  return obj;
}

async function listRibbons({ includeInactive = false } = {}) {
  const filter = {};
  if (!includeInactive) filter.isActive = true;

  const ribbons = await Ribbon.find(filter).sort({
    sortOrder: 1,
    createdAt: 1,
  });
  return ribbons.map(withImageUrl);
}

async function getRibbonById(id) {
  const ribbon = await Ribbon.findById(id);
  if (!ribbon) throw ApiError.notFound("Ribbon not found");
  return withImageUrl(ribbon);
}

async function createRibbon(data, imagePath) {
  const slug = await generateUniqueSlug(data.name);

  const ribbon = await Ribbon.create({
    name: data.name,
    slug,
    color: data.color,
    image: imagePath || "",
    price: data.price,
    isActive: data.isActive !== undefined ? data.isActive : true,
    sortOrder: data.sortOrder || 0,
  });

  return withImageUrl(ribbon);
}

async function updateRibbon(id, data, imagePath) {
  const ribbon = await Ribbon.findById(id);
  if (!ribbon) throw ApiError.notFound("Ribbon not found");

  if (data.name !== undefined) {
    ribbon.name = data.name;
    ribbon.slug = await generateUniqueSlug(data.name);
  }
  if (data.color !== undefined) ribbon.color = data.color;
  if (data.price !== undefined) ribbon.price = data.price;
  if (data.isActive !== undefined) ribbon.isActive = data.isActive;
  if (data.sortOrder !== undefined) ribbon.sortOrder = data.sortOrder;

  if (imagePath) {
    if (ribbon.image) await deleteUploadedFile(ribbon.image).catch(() => {});
    ribbon.image = imagePath;
  }

  await ribbon.save();
  return withImageUrl(ribbon);
}

async function deleteRibbon(id) {
  const ribbon = await Ribbon.findById(id);
  if (!ribbon) throw ApiError.notFound("Ribbon not found");

  if (ribbon.image) await deleteUploadedFile(ribbon.image).catch(() => {});

  await ribbon.deleteOne();
  return { _id: id };
}

module.exports = {
  listRibbons,
  getRibbonById,
  createRibbon,
  updateRibbon,
  deleteRibbon,
};
