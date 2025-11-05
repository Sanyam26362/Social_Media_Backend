module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ msg: `Duplicate ${field}` });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ msg: 'Invalid token' });
  }

  if (err.type === 'validation') {
    return res.status(400).json({ msg: 'Validation error', errors: err.errors });
  }

  res.status(500).json({ msg: 'Server error' });
};
