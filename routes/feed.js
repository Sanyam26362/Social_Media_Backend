const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getFollowingFeed } = require('../controllers/feedController');

router.get('/', auth, getFollowingFeed);

module.exports = router;
