const Order = require("../models/Order");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const GiftBox = require("../models/GiftBox");
const WrapStyle = require("../models/WrapStyle");
const Ribbon = require("../models/Ribbon");
const generateOrderNumber = require("../utils/generateOrderNumber");
const cartService = require("./cart.service");
const env = require("../config/env");
const { buildImageUrl } = require("../utils/buildImageUrl");

/**
 * Compute effective price for a product.
 */
function effectivePrice(product) {
  if (
    product.discountPrice != null &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price
  ) {
    return product.discountPrice;
  }
  return product.price;
}

/**
 * Enrich a stored order with full image URLs (for API responses).
 * Handles both product and gift-box items.
 */
function withImageUrls(order) {
  const obj = order.toJSON();
  if (obj.items) {
    obj.items = obj.items.map((it) => {
      const enriched = {
        ...it,
        imageUrl: buildImageUrl(it.imageSnapshot || ""),
      };

      // Enrich gift-box internal items with image URLs
      if (it.type === "gift-box" && it.giftBox) {
        if (it.giftBox.box) {
          it.giftBox.box.imageUrl = buildImageUrl(it.giftBox.box.image || "");
        }
        if (it.giftBox.items) {
          it.giftBox.items = it.giftBox.items.map((gi) => ({
            ...gi,
            imageUrl: buildImageUrl(gi.image || ""),
          }));
        }
        if (it.giftBox.wrap) {
          it.giftBox.wrap.imageUrl = buildImageUrl(it.giftBox.wrap.image || "");
        }
        if (it.giftBox.ribbon) {
          it.giftBox.ribbon.imageUrl = buildImageUrl(
            it.giftBox.ribbon.image || "",
          );
        }
      }

      return enriched;
    });
  }
  return obj;
}

/**
 * Build an OrderItem for a gift box.
 * Validates all referenced entities (box, wrap, ribbon, products) exist and are active.
 * Calculates the price server-side using fresh DB data.
 */
async function buildGiftBoxOrderItem(giftBoxInput) {
  if (
    !giftBoxInput ||
    !giftBoxInput.boxId ||
    !Array.isArray(giftBoxInput.items)
  ) {
    throw ApiError.badRequest("Invalid gift box configuration");
  }

  // --- Box ---
  const box = await GiftBox.findById(giftBoxInput.boxId);
  if (!box || !box.isActive) {
    throw ApiError.badRequest("Gift box is not available");
  }

  // --- Items ---
  if (giftBoxInput.items.length === 0) {
    throw ApiError.badRequest("Gift box must contain at least one item");
  }
  if (giftBoxInput.items.length > box.capacity) {
    throw ApiError.conflict(
      `Gift box capacity is ${box.capacity} items, you selected ${giftBoxInput.items.length}`,
    );
  }

  const productIds = giftBoxInput.items.map((i) => i.productId);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const itemsSnapshot = [];
  let itemsTotal = 0;

  for (const inputItem of giftBoxInput.items) {
    const product = productMap.get(String(inputItem.productId));
    if (!product) {
      throw ApiError.badRequest(`Product not found: ${inputItem.productId}`);
    }

    // Stock check
    if (product.stock < 1) {
      throw ApiError.conflict(
        `${product.name.en || product.name.ar}: out of stock`,
      );
    }

    const quantity = Math.max(1, Number(inputItem.quantity) || 1);
    if (product.stock < quantity) {
      throw ApiError.conflict(
        `${product.name.en || product.name.ar}: only ${product.stock} left in stock`,
      );
    }

    const unitPrice = effectivePrice(product);
    const lineTotal = unitPrice * quantity;

    itemsSnapshot.push({
      id: product._id.toString(),
      name: product.name,
      price: unitPrice,
      image: product.images?.[0] || "",
      quantity,
    });

    itemsTotal += lineTotal;
  }

  // --- Wrap Style ---
  let wrapSnapshot = null;
  let wrapPrice = 0;
  if (giftBoxInput.wrapStyleId) {
    const wrap = await WrapStyle.findById(giftBoxInput.wrapStyleId);
    if (!wrap || !wrap.isActive) {
      throw ApiError.badRequest("Wrap style is not available");
    }
    wrapSnapshot = {
      id: wrap._id.toString(),
      name: wrap.name,
      price: wrap.price,
      image: wrap.image || "",
    };
    wrapPrice = wrap.price;
  }

  // --- Ribbon ---
  let ribbonSnapshot = null;
  let ribbonPrice = 0;
  if (giftBoxInput.ribbonId) {
    const ribbon = await Ribbon.findById(giftBoxInput.ribbonId);
    if (!ribbon || !ribbon.isActive) {
      throw ApiError.badRequest("Ribbon is not available");
    }
    ribbonSnapshot = {
      id: ribbon._id.toString(),
      name: ribbon.name,
      price: ribbon.price,
      color: ribbon.color,
      image: ribbon.image || "",
    };
    ribbonPrice = ribbon.price;
  }

  // --- Note ---
  const note = (giftBoxInput.note || "").toString().slice(0, 500);

  // --- Total ---
  const total = box.basePrice + itemsTotal + wrapPrice + ribbonPrice;

  const giftBoxSnapshot = {
    box: {
      id: box._id.toString(),
      name: box.name,
      price: box.basePrice,
      image: box.image || "",
      capacity: box.capacity,
    },
    items: itemsSnapshot,
    wrap: wrapSnapshot,
    ribbon: ribbonSnapshot,
    note,
  };

  const nameSnapshot = {
    en: `${box.name.en || "Gift Box"} (Custom)`,
    ar: `${box.name.ar || "بوكس هدايا"} (مخصص)`,
  };

  return {
    type: "gift-box",
    product: null,
    nameSnapshot,
    imageSnapshot: box.image || "",
    priceAtPurchase: total,
    quantity: 1,
    selectedOptions: [],
    subtotal: total,
    giftBox: giftBoxSnapshot,
  };
}

/**
 * Create an order from the user's current cart.
 * The cart may contain both regular products and gift-box items.
 *
 * Steps:
 *  1. Load cart, verify not empty
 *  2. For each cart item:
 *     - product → validate & build product order item
 *     - gift-box → re-validate via buildGiftBoxOrderItem
 *  3. Compute totals server-side
 *  4. Create order with snapshots
 *  5. Decrement stock for product items (with rollback on failure)
 *  6. Decrement stock for gift-box internal products
 *  7. Clear the cart
 */
async function createOrder(userId, { shippingAddress, notes }) {
  const cart = await cartService.getOrCreateCart(userId);

  if (!cart.items || cart.items.length === 0) {
    throw ApiError.badRequest("Your cart is empty");
  }

  // ---- Load fresh products (product items only) ----
  const productIds = cart.items
    .filter((i) => i.type === "product" && i.product)
    .map((i) => i.product);

  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let subtotal = 0;

  // ---- Loop over cart items ----
  for (const item of cart.items) {
    // ============ GIFT BOX CART ITEM ============
    if (item.type === "gift-box" && item.giftBox) {
      // Re-validate everything by calling buildGiftBoxOrderItem
      const giftBoxItem = await buildGiftBoxOrderItem({
        boxId: item.giftBox.boxId,
        items: (item.giftBox.items || []).map((gi) => ({
          productId: gi.productId,
          quantity: gi.quantity || 1,
        })),
        wrapStyleId: item.giftBox.wrap?.wrapStyleId || null,
        ribbonId: item.giftBox.ribbon?.ribbonId || null,
        note: item.giftBox.note || "",
      });

      orderItems.push(giftBoxItem);
      subtotal += giftBoxItem.subtotal;
      continue;
    }

    // ============ REGULAR PRODUCT CART ITEM ============
    const product = productMap.get(item.product.toString());

    if (!product || !product.isActive) {
      throw ApiError.conflict(`Product is no longer available`);
    }

    if (product.stock < item.quantity) {
      throw ApiError.conflict(
        `${product.name.en || product.name.ar}: only ${product.stock} left in stock`,
      );
    }

    const unitPrice = effectivePrice(product);
    const lineSubtotal = unitPrice * item.quantity;

    orderItems.push({
      type: "product",
      product: product._id,
      nameSnapshot: product.name,
      imageSnapshot: product.images?.[0] || "",
      priceAtPurchase: unitPrice,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions || [],
      subtotal: lineSubtotal,
      giftBox: null,
    });

    subtotal += lineSubtotal;
  }

  // ---- Server-side totals ----
  const shippingFee = env.shippingFee || 0;
  const tax = Math.round(subtotal * (env.taxRate || 0) * 100) / 100;
  const discount = 0;
  const total =
    Math.round((subtotal + shippingFee + tax - discount) * 100) / 100;

  // ---- Create order (retry on orderNumber collision) ----
  let order;
  let attempts = 0;
  while (!order && attempts < 5) {
    attempts += 1;
    const orderNumber = generateOrderNumber();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Order.exists({ orderNumber });
    if (exists) continue;

    // eslint-disable-next-line no-await-in-loop
    const created = await Order.create({
      user: userId,
      orderNumber,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      discount,
      total,
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "cod",
      notes: notes || "",
    });

    order = created;
  }

  if (!order) {
    throw ApiError.internal("Could not generate a unique order number");
  }

  // ---- Decrement stock for product items (with rollback) ----
  const decremented = [];
  try {
    for (const item of orderItems) {
      // Skip non-product items
      if (item.type !== "product" || !item.product) continue;

      // eslint-disable-next-line no-await-in-loop
      const res = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );
      if (res.modifiedCount !== 1) {
        throw ApiError.conflict(
          `Could not reserve stock for ${item.nameSnapshot?.en || item.nameSnapshot?.ar}`,
        );
      }
      decremented.push(item);
    }
  } catch (err) {
    // Rollback
    for (const item of decremented) {
      // eslint-disable-next-line no-await-in-loop
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
      ).catch(() => {});
    }
    await Order.deleteOne({ _id: order._id }).catch(() => {});
    throw err;
  }

  // ---- Decrement stock for gift-box internal products ----
  const giftItems = orderItems.filter((i) => i.type === "gift-box");
  for (const gItem of giftItems) {
    if (!gItem.giftBox?.items) continue;
    for (const gbItem of gItem.giftBox.items) {
      // eslint-disable-next-line no-await-in-loop
      await Product.updateOne(
        { _id: gbItem.id },
        { $inc: { stock: -(gbItem.quantity || 1) } },
      ).catch(() => {});
    }
  }

  // ---- Clear the cart ----
  cart.items = [];
  await cart.save();

  return withImageUrls(order);
}

/**
 * List orders for a user (customer) or all orders (admin).
 */
async function listOrders(user, query = {}) {
  const filter = {};
  if (user.role !== "admin") filter.user = user._id;

  if (query.status) filter.status = query.status;

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
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
 * Get a single order.
 * Customers may only access their own orders.
 */
async function getOrderById(user, orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");

  if (user.role !== "admin" && order.user.toString() !== user._id.toString()) {
    throw ApiError.forbidden("You do not have access to this order");
  }

  return withImageUrls(order);
}

/**
 * Update order status (admin).
 * If status moves to "cancelled" from a non-cancelled state, restock product items.
 */
async function updateOrderStatus(orderId, newStatus) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");

  const wasCancelled = order.status === "cancelled";
  const willBeCancelled = newStatus === "cancelled";

  order.status = newStatus;

  // Restock when transitioning into "cancelled"
  if (!wasCancelled && willBeCancelled) {
    // Restock regular product items
    for (const item of order.items) {
      // Skip non-product items
      if (item.type !== "product" || !item.product) continue;

      // eslint-disable-next-line no-await-in-loop
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
      ).catch(() => {});
    }

    // Restock gift-box internal products
    const giftItems = order.items.filter((i) => i.type === "gift-box");
    for (const gItem of giftItems) {
      if (!gItem.giftBox?.items) continue;
      for (const gbItem of gItem.giftBox.items) {
        // eslint-disable-next-line no-await-in-loop
        await Product.updateOne(
          { _id: gbItem.id },
          { $inc: { stock: gbItem.quantity || 1 } },
        ).catch(() => {});
      }
    }
  }

  await order.save();
  return withImageUrls(order);
}

/**
 * Get tracking info (status only in V1).
 */
async function getOrderTracking(user, orderId) {
  const order = await getOrderById(user, orderId);
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  getOrderTracking,
};
