const AppError = require('../utils/AppError');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error stack for debugging (in dev)
  if (process.env.NODE_ENV !== 'production') {
    console.error('💥 ERROR:', err);
  }

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message || 'Internal Server Error',
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
