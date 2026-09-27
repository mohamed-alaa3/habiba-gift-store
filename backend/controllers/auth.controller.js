const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const authService = require("../services/auth.service");

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const result = await authService.registerUser({
    name,
    email,
    password,
    phone,
  });
  return ok(res, result, undefined, 201);
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  return ok(res, result);
});

/**
 * GET /api/auth/me  (protected)
 */
const me = asyncHandler(async (req, res) => {
  const user = authService.getCurrentUser(req.user);
  return ok(res, user);
});

/**
 * PATCH /api/auth/me  (protected)
 */
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await authService.updateProfile(req.user._id, { name, phone });
  return ok(res, user);
});

/**
 * PATCH /api/auth/change-password  (protected)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, {
    currentPassword,
    newPassword,
  });
  return ok(res, { message: "Password updated successfully" });
});

module.exports = {
  register,
  login,
  me,
  updateMe,
  changePassword,
};
