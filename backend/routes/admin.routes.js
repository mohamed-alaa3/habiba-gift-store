const express = require("express");
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const adminCouponRoutes = require("./adminCoupon.routes");
const adminSettingRoutes = require("./adminSetting.routes");

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, authorize("admin"));

router.get("/stats/overview", adminController.overview);
router.get("/stats/revenue", adminController.revenueSeries);
router.get("/products/low-stock", adminController.lowStock);
router.get("/products/top", adminController.topProducts);
router.get("/orders/recent", adminController.recentOrders);

// Coupons CRUD → /api/admin/coupons
router.use("/coupons", adminCouponRoutes);

// Store settings → /api/admin/settings
router.use("/settings", adminSettingRoutes);

module.exports = router;
