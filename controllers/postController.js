const asyncHandler = require('../middleware/asyncHandler');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const Post = require('../models/Post');

exports.createPostValidators = [
  body('content').optional().isString().isLength({ min: 1, max: 280 }),
  body('quotedPostId').optional().isMongoId(),
  validate,
];

exports.createPost = asyncHandler(async (req, res) => {
  const { content, quotedPostId } = req.body;

  if (!content && !quotedPostId) {
    return res.status(400).json({ msg: 'Post content or a quoted post is required' });
  }

  const postData = { user: req.user.id, content };
  if (quotedPostId) {
    const quoted = await Post.findById(quotedPostId).lean();
    if (!quoted) return res.status(404).json({ msg: 'Post to quote not found' });
    postData.quotedPost = quoted._id;
  }

  const post = await Post.create(postData);

  const populated = await Post.findById(post.id)
    .populate('user', ['username'])
    .populate({ path: 'quotedPost', populate: { path: 'user', select: 'username' } });

  res.status(201).json(populated);
});

exports.getAllPosts = asyncHandler(async (_req, res) => {
  const posts = await Post.find()
    .populate('user', ['username'])
    .populate({ path: 'quotedPost', populate: { path: 'user', select: 'username' } })
    .sort({ createdAt: -1 })
    .lean();

  res.json(posts);
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!post) return res.status(404).json({ msg: 'Post not found or user not authorized' });
  res.json({ msg: 'Post removed' });
});

exports.likePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hasLiked = await Post.exists({ _id: id, likes: req.user.id });
  const update = hasLiked ? { $pull: { likes: req.user.id } } : { $addToSet: { likes: req.user.id } };
  const updated = await Post.findByIdAndUpdate(id, update, { new: true }).select('likes').lean();
  if (!updated) return res.status(404).json({ msg: 'Post not found' });
  res.json(updated.likes);
});

exports.repostPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const hasReposted = await Post.exists({ _id: id, reposts: req.user.id });
  const update = hasReposted ? { $pull: { reposts: req.user.id } } : { $addToSet: { reposts: req.user.id } };
  const updated = await Post.findByIdAndUpdate(id, update, { new: true }).select('reposts').lean();
  if (!updated) return res.status(404).json({ msg: 'Post not found' });
  res.json(updated.reposts);
});
