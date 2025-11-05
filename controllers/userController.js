const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
});

exports.followUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ msg: 'You cannot follow yourself' });

  const target = await User.findById(req.params.id).lean();
  if (!target) return res.status(404).json({ msg: 'User not found' });

  const me = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { following: target._id } },
    { new: true }
  );

  if (!me) return res.status(404).json({ msg: 'Current user not found' });

  await User.findByIdAndUpdate(target._id, { $addToSet: { followers: me._id } });

  res.json({ msg: 'User followed' });
});

exports.unfollowUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id).lean();
  if (!target) return res.status(404).json({ msg: 'User not found' });

  await User.findByIdAndUpdate(req.user.id, { $pull: { following: target._id } });
  await User.findByIdAndUpdate(target._id, { $pull: { followers: req.user.id } });

  res.json({ msg: 'User unfollowed' });
});
