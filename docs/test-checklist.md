# Habiba Backend — Test Checklist

Use this after the server is running and MongoDB is connected.

## Prerequisites

1. Admin user created (node scripts/seedAdmin.js).
2. At least one category created (via API).
3. At least one product created (via API).

Login to get tokens:
- Admin token: POST /api/auth/login with admin credentials.
- Customer token: register via POST /api/auth/register and login.

---

## 1. Health

- [ ] GET /api/health -> 200 with "database": "connected".
- [ ] GET /api/nothing -> 404 with standard error shape.

---

## 2. Auth

- [ ] Register new customer -> 201 + user + token.
- [ ] Register with duplicate email -> 409.
- [ ] Register with invalid email -> 400.
- [ ] Register with short password -> 400.
- [ ] Login with correct credentials -> 200 + token.
- [ ] Login with wrong password -> 401.
- [ ] GET /api/auth/me with valid token -> 200.
- [ ] GET /api/auth/me without token -> 401.
- [ ] GET /api/auth/me with fake token -> 401.
- [ ] PATCH /api/auth/change-password with correct current -> 200.
- [ ] PATCH /api/auth/change-password with wrong current -> 400.
- [ ] Rate limit: 11 consecutive login attempts -> last one 429.

---

## 3. Categories

- [ ] POST /api/categories (admin, form-data with image) -> 201 with imageUrl.
- [ ] GET /api/categories -> array containing the created category.
- [ ] GET /api/categories/:id -> category details.
- [ ] POST /api/categories without name -> 400.
- [ ] POST /api/categories as customer -> 403.
- [ ] PATCH /api/categories/:id with new image -> old image deleted from disk.
- [ ] DELETE /api/categories/:id -> 200; image deleted from disk.
- [ ] DELETE /api/categories/:id for a category with products -> 409.

---

## 4. Products

- [ ] POST /api/products with 1 image -> 201 + imageUrls.
- [ ] POST /api/products with 3 images -> 201 with 3 URLs.
- [ ] POST /api/products without images -> 400.
- [ ] POST /api/products with invalid category id -> 400.
- [ ] POST /api/products with discountPrice >= price -> 400.
- [ ] GET /api/products -> paginated list, meta present.
- [ ] GET /api/products?category=<id> -> filter works.
- [ ] GET /api/products?q=candle -> search works.
- [ ] GET /api/products?sort=price-asc -> sorted ascending.
- [ ] GET /api/products/:id -> product by id.
- [ ] GET /api/products/<slug> -> product by slug.
- [ ] GET /api/products/:id/related -> same-category products, excluding self.
- [ ] PATCH /api/products/:id -> updates fields.
- [ ] PATCH /api/products/:id with new images -> old files removed from disk.
- [ ] DELETE /api/products/:id -> 200 with isActive: false (soft delete).
- [ ] After delete, product not in public list.
- [ ] Admin can fetch inactive product via ?includeInactive=true.
- [ ] POST /api/products as customer -> 403.

---

## 5. Reviews

- [ ] POST /api/products/:productId/reviews as customer -> 201.
- [ ] Same customer posts again -> 409.
- [ ] Product ratingAvg and ratingCount updated after review.
- [ ] GET /api/products/:productId/reviews -> paginated list.
- [ ] Post review with rating = 6 -> 400.
- [ ] Post review without auth -> 401.

---

## 6. Cart

- [ ] POST /api/cart with valid productId -> 201, item added.
- [ ] POST /api/cart with same product again -> quantity incremented.
- [ ] POST /api/cart with quantity > stock -> 409.
- [ ] POST /api/cart without auth -> 401.
- [ ] GET /api/cart -> returns items with fresh prices.
- [ ] Manually change product price; GET /api/cart reflects new price.
- [ ] PATCH /api/cart/:itemId with quantity=2 -> updated.
- [ ] PATCH /api/cart/:itemId with quantity=0 -> 400.
- [ ] DELETE /api/cart/:itemId -> item removed.
- [ ] DELETE /api/cart -> cart emptied.

---

## 7. Orders

- [ ] Ensure cart has items.
- [ ] POST /api/orders with shippingAddress -> 201 with orderNumber, snapshots.
- [ ] Cart is emptied after order.
- [ ] Product stock decremented after order.
- [ ] POST /api/orders with empty cart -> 400.
- [ ] POST /api/orders when stock insufficient -> 409.
- [ ] GET /api/orders as customer -> only own orders.
- [ ] GET /api/orders as admin -> all orders.
- [ ] GET /api/orders/:id as another customer -> 403.
- [ ] GET /api/orders/:id/tracking -> status info.
- [ ] PATCH /api/orders/:id/status as admin to cancelled -> stock restocked.
- [ ] PATCH /api/orders/:id/status as customer -> 403.

---

## 8. Wishlist

- [ ] POST /api/wishlist with valid productId -> 201.
- [ ] POST /api/wishlist with same product -> still 201, no duplicate.
- [ ] GET /api/wishlist -> list.
- [ ] DELETE /api/wishlist/:productId -> removed.
- [ ] DELETE /api/wishlist/:productId again -> 200, no error.
- [ ] All endpoints require auth -> 401 without token.

---

## 9. Addresses

- [ ] POST /api/addresses first address -> isDefault: true automatically.
- [ ] POST /api/addresses second address with isDefault: true -> first becomes non-default.
- [ ] GET /api/addresses -> sorted default first.
- [ ] PATCH /api/addresses/:id -> updates fields.
- [ ] PATCH /api/addresses/:id/default -> becomes default, others unset.
- [ ] DELETE /api/addresses/:id (non-default) -> removed.
- [ ] DELETE /api/addresses/:id (default) -> newest remaining becomes default.
- [ ] Accessing another user's address by id -> 404.

---

## 10. Banners

- [ ] POST /api/banners (admin, form-data with image) -> 201.
- [ ] GET /api/banners?position=hero -> filtered.
- [ ] POST /api/banners without image -> 400.
- [ ] PATCH /api/banners/:id with new image -> old file removed.
- [ ] DELETE /api/banners/:id -> 200; image removed from disk.
- [ ] Non-admin POST -> 403.

---

## 11. Newsletter

- [ ] POST /api/newsletter/subscribe with valid email -> 201.
- [ ] Same email again -> 200 (idempotent).
- [ ] Invalid email -> 400.
- [ ] GET /api/newsletter as admin -> list.
- [ ] PATCH /api/newsletter/:id toggles isActive.
- [ ] DELETE /api/newsletter/:id -> removed.

---

## 12. Contact

- [ ] POST /api/contact with valid payload -> 201.
- [ ] Missing message -> 400.
- [ ] Invalid email -> 400.
- [ ] GET /api/contact as admin -> list.
- [ ] PATCH /api/contact/:id with status: "read" -> updated.
- [ ] DELETE /api/contact/:id -> removed.
- [ ] Non-admin access -> 403.

---

## 13. Admin Statistics

- [ ] GET /api/admin/stats/overview -> revenue, orders, customers.
- [ ] GET /api/admin/stats/revenue?range=7d -> daily buckets.
- [ ] GET /api/admin/products/low-stock?threshold=10 -> products with stock <= 10.
- [ ] GET /api/admin/products/top?range=30d&limit=5 -> top by revenue.
- [ ] GET /api/admin/orders/recent -> 5 most recent orders.
- [ ] All endpoints require admin -> 403 for customers.

---

## 14. Security

- [ ] Response header X-Powered-By is NOT present.
- [ ] Sending {"email": {"$gt": ""}} in login -> 400 (sanitized).
- [ ] Sending duplicate query params (?a=1&a=2) -> handled (hpp).
- [ ] Oversized file upload (> 5MB) -> 413.
- [ ] Wrong file type (.exe) -> 400.
- [ ] 300+ requests to /api/* in 15 min -> 429 (general limiter).
- [ ] Invalid ObjectId in any :id param -> 400 or 404 (not 500).

---

## 15. General

- [ ] All successful responses have { success: true, data: ... }.
- [ ] All error responses have { success: false, message: ... }.
- [ ] All list endpoints support pagination and return meta.
- [ ] Unknown route -> 404 with standard shape.
- [ ] Server restarts cleanly with no warnings.