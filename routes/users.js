const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param } = require('express-validator');
const { getUserProfile, followUser, unfollowUser } = require('../controllers/userController');

router.get('/:id', [param('id').isMongoId(), validate], getUserProfile);
router.put('/follow/:id', auth, [param('id').isMongoId(), validate], followUser);
router.put('/unfollow/:id', auth, [param('id').isMongoId(), validate], unfollowUser);

module.exports = router;
