const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  deleteComment,
  likeComment,
} = require('../controllers/commentController');


router.delete('/:id', auth, deleteComment);


router.put('/like/:id', auth, likeComment);

module.exports = router;