const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

/**
 * Verifies the Bearer JWT token from the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token.', 401));
  }
};

/**
 * Restricts route to admin role only.
 * Must be used AFTER authenticate.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden: admin only.', 403));
  }
  next();
};

module.exports = { authenticate, requireAdmin };
