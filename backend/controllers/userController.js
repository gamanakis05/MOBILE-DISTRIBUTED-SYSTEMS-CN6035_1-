const UserModel = require('../models/userModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');

/**
 * GET /user/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.userId);
  if (!user) throw new AppError('User not found.', 404);

  res.json({
    success: true,
    data: {
      userId: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    }
  });
});

/**
 * PUT /user/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (password) updates.password = await bcrypt.hash(password, 12);

  await UserModel.updateProfile(req.user.userId, updates);

  res.json({
    success: true,
    message: 'Profile updated successfully.'
  });
});

module.exports = { getProfile, updateProfile };
