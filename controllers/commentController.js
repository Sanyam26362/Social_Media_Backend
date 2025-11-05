const asyncHandler = require('../middleware/asyncHandler');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const Comment = require('../models/Comments');
const Post = require('../models/Post');

exports.createCommentValidators = [
  param('id').isMongoId(),
  body('content').isString().isLength({ min: 1, max: 280 }),
  validate,
];

exports.createComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).lean();
  if (!post) return res.status(404).json({ msg: 'Post not found' });

  const comment = await Comment.create({
    content: req.body.content,
    user: req.user.id,
    post: req.params.id,
  });

  res.status(201).json(comment);
});

exports.getCommentsForPost = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate('user', ['username'])
    .sort({ createdAt: -1 })
    .lean();

  res.json(comments);
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ msg: 'Comment not found' });
  if (comment.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });

  await comment.deleteOne();
  res.json({ msg: 'Comment removed' });
});

exports.likeComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ msg: 'Comment not found' });

  const hasLiked = comment.likes.some((l) => l.toString() === req.user.id);
  const update = hasLiked ? { $pull: { likes: req.user.id } } : { $addToSet: { likes: req.user.id } };

  const updated = await Comment.findByIdAndUpdate(id, update, { new: true }).select('likes').lean();
  res.json(updated.likes);
});
