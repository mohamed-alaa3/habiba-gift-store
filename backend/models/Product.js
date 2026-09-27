const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema(
  {
    en: { type: String, trim: true, default: "" },
    ar: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

// Embedded options — allows future per-value price/stock without a Variant model
const optionValueSchema = new mongoose.Schema(
  {
    name: { type: translationSchema, required: true },
    // reserved for future use — keep commented to avoid premature complexity
    // priceDelta: { type: Number, default: 0 },
    // stock: { type: Number, default: 0 },
    // sku: { type: String, default: '' },
  },
  { _id: false },
);

const optionSchema = new mongoose.Schema(
  {
    name: { type: translationSchema, required: true },
    values: {
      type: [optionValueSchema],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "An option must have at least one value",
      },
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: translationSchema,
      required: true,
      validate: {
        validator: (v) => v && (v.en || v.ar),
        message: "Product name must include English or Arabic",
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: translationSchema,
      default: () => ({}),
    },
    shortDescription: {
      type: translationSchema,
      default: () => ({}),
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      default: null,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          return v < this.price;
        },
        message: "Discount price must be less than the regular price",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: "At least one product image is required",
      },
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
      sparse: true,
      unique: true,
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// Text index for basic search (name + descriptions)
productSchema.index({ "name.en": "text", "name.ar": "text" });

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
