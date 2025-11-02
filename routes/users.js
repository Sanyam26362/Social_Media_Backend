const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getUserProfile,
    followUser,
    unfollowUser
} = require('../controllers/userController');
router.get('/:id',getUserProfile);
router.put('/follow/:id',auth,followUser);
router.put('/unfollow/:id',auth,unfollowUser);
module.exports=router;