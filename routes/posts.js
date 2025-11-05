const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param } = require('express-validator');

const {
  createPost,
  getAllPosts,
  deletePost,
  likePost,
  repostPost,
  createPostValidators,
} = require('../controllers/postController');

const {
  createComment,
  getCommentsForPost,
  createCommentValidators,
} = require('../controllers/commentController');

router.post('/', auth, createPostValidators, createPost);
router.get('/', getAllPosts);
router.delete('/:id', auth, [param('id').isMongoId(), validate], deletePost);
router.put('/like/:id', auth, [param('id').isMongoId(), validate], likePost);
router.put('/:id/repost', auth, [param('id').isMongoId(), validate], repostPost);

router.post('/:id/comment', auth, createCommentValidators, createComment);
router.get('/:id/comments', [param('id').isMongoId(), validate], getCommentsForPost);

module.exports = router;
