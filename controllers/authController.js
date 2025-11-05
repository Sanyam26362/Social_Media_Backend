const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/asyncHandler');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const User = require('../models/User');

exports.registerValidators = [
  body('username').isString().isLength({ min: 3, max: 32 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate,
];

exports.loginValidators = [body('email').isEmail(), body('password').exists(), validate];

const signToken = (user) =>
  jwt.sign({ user: { id: user._id.toString() } }, process.env.JWT_SECRET, {
    expiresIn: '5h',
  });

exports.registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { username }] }).lean();
  if (exists) {
    return res.status(409).json({
      msg:
        exists.email === email
          ? 'User with this email already exists'
          : 'User with this username already exists',
    });
  }

  const user = await User.create({ username, email, password });
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
});

exports.getMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user.id).lean().select('-password');
  if (!me) return res.status(404).json({ msg: 'User not found' });
  res.json(me);
});
