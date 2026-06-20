const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/userModel');
const RefreshTokenModel = require('../models/refreshTokenModel');
const AppError = require('../utils/AppError');

const ACCESS_SECRET  = process.env.JWT_SECRET;
const ACCESS_EXP     = process.env.JWT_EXPIRES_IN        || '1h';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const REFRESH_EXP    = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXP }
  );
};

const generateRefreshToken = async (userId) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await RefreshTokenModel.create(userId, token, expiresAt);
  return token;
};

const rotateRefreshToken = async (oldToken) => {
  const tokenData = await RefreshTokenModel.findValidToken(oldToken);
  if (!tokenData) {
    throw new AppError('Refresh token invalid or expired.', 401);
  }

  const { user_id } = tokenData;

  // Delete old token
  await RefreshTokenModel.delete(oldToken);

  // Get user
  const user = await UserModel.findById(user_id);
  if (!user) throw new AppError('User not found.', 404);

  const accessToken  = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user_id);

  return { accessToken, refreshToken, user };
};

const revokeRefreshToken = async (token) => {
  await RefreshTokenModel.delete(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
};
