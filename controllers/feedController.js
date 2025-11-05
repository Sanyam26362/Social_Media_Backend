const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Post = require('../models/Post');

exports.getFollowingFeed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean().select('following');
  const followingList = [...(user?.following || []), req.user.id];

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const posts = await Post.find({ user: { $in: followingList } })
    .populate('user', ['username'])
    .populate({ path: 'quotedPost', populate: { path: 'user', select: 'username' } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.json({ page, limit, count: posts.length, data: posts });
});
