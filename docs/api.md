# Habiba API Reference

Base URL: <API_BASE_URL>/api  (e.g. http://localhost:5000/api)

## Response Envelope

Success:
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 12, "total": 120 } }

Error:
{ "success": false, "message": "Product not found", "errors": [{ "field": "email", "message": "..." }] }

## Auth

- Customer endpoints need header: Authorization: Bearer <token> (role: customer or admin).
- Admin endpoints need the same header with role admin.

---

## 1. Health

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /health | Public | Server + DB status |

---

## 2. Auth

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | /auth/register | Public | { name, email, password, phone? } |
| POST | /auth/login | Public | { email, password } |
| GET | /auth/me | Customer | — |
| PATCH | /auth/me | Customer | { name?, phone? } |
| PATCH | /auth/change-password | Customer | { currentPassword, newPassword } |

Response on register/login:
{ "success": true, "data": { "user": { ... }, "token": "..." } }

Rate limited: 10 requests / 15 min on register/login/change-password.

---

## 3. Categories

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | /categories | Public | — |
| GET | /categories/:id | Public | — |
| POST | /categories | Admin | multipart/form-data: name.en, name.ar, description.en?, description.ar?, sortOrder?, isActive?, image (file) |
| PATCH | /categories/:id | Admin | Same as POST, all optional |
| DELETE | /categories/:id | Admin | Fails (409) if products exist in category |

---

## 4. Products

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /products | Public | Query: q, category, minPrice, maxPrice, rating, inStock, featured, sort, page, limit |
| GET | /products/:id | Public | Accepts id OR slug |
| GET | /products/:id/related | Public | Query: limit (default 4) |
| POST | /products | Admin | multipart/form-data: name.en, name.ar, description.en, description.ar, shortDescription.en?, shortDescription.ar?, price, discountPrice?, category (id), stock?, sku?, isFeatured?, isActive?, options? (JSON string), images (1-5 files) |
| PATCH | /products/:id | Admin | Same fields, all optional. New images replaces the old set. |
| DELETE | /products/:id | Admin | Soft delete: sets isActive=false |

Sort values: newest, oldest, price-asc, price-desc, rating-desc, featured.

Product response includes imageUrls: [ ... ] (full URLs).

---

## 5. Reviews

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | /products/:productId/reviews | Public | Query: page, limit |
| POST | /products/:productId/reviews | Customer | { rating: 1-5, comment? } |

One review per user per product. Duplicate -> 409. Auto-approved in V1.

---

## 6. Cart

All cart routes require authentication.

| Method | Path | Body |
|---|---|---|
| GET | /cart | — |
| POST | /cart | { productId, quantity?, selectedOptions? } |
| PATCH | /cart/:itemId | { quantity } |
| DELETE | /cart/:itemId | — |
| DELETE | /cart | Clear entire cart |

Cart response includes:
- items[] with fresh product data (price, stock, availability).
- subtotal, itemCount, hasUnavailable flag.

---

## 7. Orders

All order routes require authentication.

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | /orders | Customer | { shippingAddress: { fullName, phone, country, city, street, area?, building?, apartment?, postalCode? }, notes? } |
| GET | /orders | Customer/Admin | Customer sees own; admin sees all. Query: status, page, limit |
| GET | /orders/:id | Customer/Admin | Customer restricted to own orders |
| GET | /orders/:id/tracking | Customer/Admin | Status info only |
| PATCH | /orders/:id/status | Admin | { status } (pending, confirmed, processing, shipped, delivered, cancelled) |

Order response includes:
- orderNumber (format: HB-XXXXXXXX).
- items[] with snapshots (name, image, price, options).
- shippingAddress snapshot.
- Server-calculated subtotal, shippingFee, tax, discount, total.

Stock decrements on order creation. Cancelling restocks items.

---

## 8. Wishlist

All wishlist routes require authentication.

| Method | Path | Body |
|---|---|---|
| GET | /wishlist | — |
| POST | /wishlist | { productId } |
| DELETE | /wishlist/:productId | — |

Idempotent: adding an existing product is a no-op. Removing a missing product is a no-op.

---

## 9. Addresses

All address routes require authentication.

| Method | Path | Body |
|---|---|---|
| GET | /addresses | — |
| GET | /addresses/:id | — |
| POST | /addresses | { fullName, phone, country, city, street, area?, building?, apartment?, postalCode?, isDefault? } |
| PATCH | /addresses/:id | Same fields, all optional |
| DELETE | /addresses/:id | — |
| PATCH | /addresses/:id/default | — |

First address is always default. Setting a new default unsets others.

---

## 10. Banners

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | /banners | Public | Query: position (hero, promo, home-mid), includeInactive (admin only) |
| GET | /banners/:id | Admin | — |
| POST | /banners | Admin | multipart/form-data: title.en, title.ar, subtitle.en?, subtitle.ar?, buttonText.en?, buttonText.ar?, buttonLink?, position, isActive?, sortOrder?, image (file) |
| PATCH | /banners/:id | Admin | Same, all optional |
| DELETE | /banners/:id | Admin | — |

---

## 11. Newsletter

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | /newsletter/subscribe | Public | { email } |

Returns 201 on new subscription, 200 if already subscribed. Rate limited.

Admin endpoints:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /newsletter | Admin | Query: isActive, page, limit |
| PATCH | /newsletter/:id | Admin | { isActive } |
| DELETE | /newsletter/:id | Admin | — |

---

## 12. Contact

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | /contact | Public | { name, email, subject?, message } |

Returns 201 with a friendly message. Rate limited.

Admin endpoints:

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /contact | Admin | Query: status, page, limit |
| GET | /contact/:id | Admin | — |
| PATCH | /contact/:id | Admin | { status: new | read | replied } |
| DELETE | /contact/:id | Admin | — |

---

## 13. Admin Statistics

All endpoints require admin role.

| Method | Path | Query |
|---|---|---|
| GET | /admin/stats/overview | range (today, 7d, 30d, 90d, custom), from, to |
| GET | /admin/stats/revenue | Same |
| GET | /admin/products/low-stock | threshold (default 5), limit |
| GET | /admin/products/top | range, limit (default 5) |
| GET | /admin/orders/recent | limit (default 5) |

---

## Common Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error / bad request |
| 401 | Missing/invalid token |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, out of stock, category has products) |
| 413 | File too large |
| 429 | Rate limited |
| 500 | Internal error |

---

## Image URLs

All image fields (image, imageUrl, imageUrls) are stored as relative paths in the DB (e.g. /uploads/products/foo.webp). The API also returns full URLs built from API_BASE_URL. Frontend should use the imageUrl / imageUrls fields.