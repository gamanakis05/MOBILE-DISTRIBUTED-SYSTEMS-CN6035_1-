const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const UserModel = require('../models/userModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * POST /register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new AppError('Email already registered.', 409);
  }

  const hashed = await bcrypt.hash(password, 12);
  const userId = await UserModel.create(name, email, hashed);

  const user = { user_id: userId, email, role: 'user' };
  const accessToken  = authService.generateAccessToken(user);
  const refreshToken = await authService.generateRefreshToken(userId);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: {
      accessToken,
      refreshToken,
      user: { userId, name, email, role: 'user' }
    }
  });
});

/**
 * POST /login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password || ''))) {
    throw new AppError('Invalid credentials.', 401);
  }

  if (!user.password && user.external_id) {
    throw new AppError('This account uses social login.', 401);
  }

  const accessToken  = authService.generateAccessToken(user);
  const refreshToken = await authService.generateRefreshToken(user.user_id);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { userId: user.user_id, name: user.name, email: user.email, role: user.role }
    }
  });
});

/**
 * POST /auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token required.', 400);

  const tokens = await authService.rotateRefreshToken(refreshToken);

  res.json({
    success: true,
    data: {
      accessToken:  tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        userId: tokens.user.user_id,
        name:   tokens.user.name,
        email:  tokens.user.email,
        role:   tokens.user.role
      }
    }
  });
});

/**
 * POST /auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken).catch(() => {});
  }
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

module.exports = { register, login, refresh, logout };
