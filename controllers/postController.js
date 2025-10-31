const Post = require('../models/Post');
const User = require('../models/User'); 

exports.createPost = async (req, res) => { 
  try {
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
      content: req.body.content,
      user: req.user.id,
      username: user.username, 
    });

    const post = await newPost.save();

    res.json(post); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllPosts = async (req, res) => { 
  try {
    const posts = await Post.find()
      .populate('user', ['username'])
      .sort({ createdAt: -1 });

    res.json(posts); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();
    res.json({ msg: 'Post removed' }); 
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};

exports.likePost = async (req, res) => {
  try {
   
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

   
    
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      
     
      post.likes = post.likes.filter(
        
        (like) => like.user.toString() !== req.user.id 
      );

    } else {
      
     
      post.likes.unshift({ user: req.user.id });
    }

 
    await post.save();
    res.json(post.likes);

  } catch (err) { 
    console.error(err.message);
    res.status(500).send('Server error');
  }
};