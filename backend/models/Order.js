const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema(
  {
    en: { type: String, trim: true, default: "" },
    ar: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const selectedOptionSchema = new mongoose.Schema(
  {
    name: { type: translationSchema, required: true },
    value: { type: translationSchema, required: true },
  },
  { _id: false },
);

// Snapshot of product info at purchase time
const orderItemSchema = new mongoose.Schema(
  {
    // Discriminator: product (default) or gift-box
    type: {
      type: String,
      enum: ["product", "gift-box"],
      default: "product",
    },

    // For products (existing behavior)
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: function () {
        return this.type === "product";
      },
    },
    nameSnapshot: {
      type: translationSchema,
      required: true,
    },
    imageSnapshot: {
      type: String,
      default: "",
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedOptions: {
      type: [selectedOptionSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // For gift-box items
    giftBox: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      // Expected shape:
      // {
      //   box: { id, name, price, image },
      //   items: [{ id, name, price, image, quantity }],
      //   wrap: { id, name, price, image },
      //   ribbon: { id, name, price, color, image },
      //   note: string
      // }
    },
  },
  { _id: false },
);

// Snapshot of shipping address at purchase time
const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, default: "" },
    street: { type: String, required: true },
    building: { type: String, default: "" },
    apartment: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },
  { _id: false },
);

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const PAYMENT_METHODS = ["cod"];

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: {
      type: addressSnapshotSchema,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: "Invalid order status",
      },
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: "Invalid payment status",
      },
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: "Invalid payment method",
      },
      default: "cod",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes must be at most 500 characters"],
      default: "",
    },
  },
  { timestamps: true },
);

orderSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
