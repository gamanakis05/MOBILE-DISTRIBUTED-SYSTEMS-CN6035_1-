const { validationResult } = require('express-validator');

/**
 * Validation Handler Middleware
 * Processes errors from express-validator and returns them in a consistent format.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};

module.exports = validate;
