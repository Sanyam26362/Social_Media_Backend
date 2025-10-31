const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createPost,
    getAllPosts,
    deletePost,
    likePost,

} = require('../controllers/postController');
router.post('/',auth,createPost);
router.get('/',getAllPosts);
router.delete('/:id',auth,deletePost);
router.put('/like/:id',auth,likePost);
module.exports=router;