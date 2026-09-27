const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../utils/generateToken");
const { ROLES } = require("../config/constants");

/**
 * Creates a new customer account.
 * Password is hashed by the User model's pre-save hook.
 */
async function registerUser({ name, email, password, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || "",
    role: ROLES.CUSTOMER,
  });

  const token = generateToken({ id: user._id.toString(), role: user.role });

  // ensure password not returned even though it was select:false
  const safeUser = user.toJSON();

  return { user: safeUser, token };
}

/**
 * Authenticates email + password.
 * Returns user + token on success.
 */
async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Account is disabled");
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = generateToken({ id: user._id.toString(), role: user.role });
  const safeUser = user.toJSON();

  return { user: safeUser, token };
}

/**
 * Returns the current user (already attached by authenticate middleware).
 * This is a no-op read for the /me endpoint.
 */
function getCurrentUser(user) {
  return user.toJSON();
}

/**
 * Updates name / phone on the current user.
 */
async function updateProfile(userId, { name, phone }) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();
  return user.toJSON();
}

/**
 * Changes the current user's password.
 */
async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const match = await user.comparePassword(currentPassword);
  if (!match) throw ApiError.badRequest("Current password is incorrect");

  user.password = newPassword; // will be hashed by pre-save hook
  await user.save();
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
};
