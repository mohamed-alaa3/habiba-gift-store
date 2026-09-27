# Habiba Store — Backend

Node.js + Express + MongoDB API for the Habiba gift store.

## Requirements

- Node.js >= 20
- MongoDB ( Atlas)
- npm

## Quick Start

# 1. Install dependencies
npm install

# 2. Copy environment template
# Windows: copy .env.example .env
# macOS/Linux: cp .env.example .env

# 3. Edit .env with your values:
#    - MONGO_URI      ()
#    - JWT_SECRET     ()
#    - API_BASE_URL   (e.g. http://localhost:5000 in dev)
#    - CORS_ORIGIN    (frontend URL, e.g. http://localhost:4200)

# 4. Start the server
npm run dev     # development (nodemon)
npm start       # production

Server runs on http://localhost:5000 by default.

## Health Check

GET http://localhost:5000/api/health

Expected:
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}

## Project Structure

backend/
├── config/         # env, db, constants
├── models/         # Mongoose models (11)
├── controllers/    # HTTP handlers
├── services/       # business logic
├── middleware/     # auth, upload, error handling, sanitization
├── routes/         # Express routers
├── validators/     # express-validator chains
├── utils/          # helpers (ApiError, asyncHandler, slugify, etc.)
├── uploads/        # user-uploaded files (products, categories, banners)
├── scripts/        # one-off scripts (seedAdmin, etc.)
├── app.js          # Express app
├── server.js       # HTTP server entry
└── package.json

## Creating the First Admin

Run once after setup:

node scripts/seedAdmin.js

Default credentials (change in production):
- email: admin@habiba.test
- password: Admin12345

## API Documentation

See docs/api.md.

## Test Checklist

See docs/test-checklist.md.