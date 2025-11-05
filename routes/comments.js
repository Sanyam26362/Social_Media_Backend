const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param } = require('express-validator');
const {
  deleteComment,
  likeComment,
  createComment,
  getCommentsForPost,
  createCommentValidators,
} = require('../controllers/commentController');

router.delete('/:id', auth, [param('id').isMongoId(), validate], deleteComment);
router.put('/like/:id', auth, [param('id').isMongoId(), validate], likeComment);

router.post('/:id', auth, createCommentValidators, createComment);
router.get('/post/:id', [param('id').isMongoId(), validate], getCommentsForPost);

module.exports = router;
