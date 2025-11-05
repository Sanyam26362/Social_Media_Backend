const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
  createPost,
  getAllPosts,
  deletePost,
  likePost,
  repostPost, 
} = require('../controllers/postController');

const {
  createComment,
  getCommentsForPost,
} = require('../controllers/commentController'); 


router.post('/', auth, createPost);


router.get('/', getAllPosts);


router.delete('/:id', auth, deletePost);


router.put('/like/:id', auth, likePost);


router.put('/:id/repost', auth, repostPost);


router.post('/:id/comment', auth, createComment);


router.get('/:id/comments', getCommentsForPost);

module.exports = router;