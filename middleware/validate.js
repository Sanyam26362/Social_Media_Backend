const { validationResult } = require('express-validator');

module.exports = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error('Validation error');
    error.type = 'validation';
    error.errors = result.array();
    return next(error);
  }
  next();
};
