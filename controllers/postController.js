const Post = require('../models/Post');
const User = require('../models/User');


exports.createPost = async (req, res) => {
  try {
    const { content, quotedPostId } = req.body;

    if (!content && !quotedPostId) {
      return res
        .status(400)
        .json({ msg: 'Post content or a quoted post is required' });
    }

    const postData = {
      user: req.user.id,
      content: content,
    };

    if (quotedPostId) {
      const postToQuote = await Post.findById(quotedPostId);
      if (!postToQuote) {
        return res.status(404).json({ msg: 'Post to quote not found' });
      }
      postData.quotedPost = postToQuote.id;
    }

    const newPost = new Post(postData);
    const post = await newPost.save();

    const populatedPost = await Post.findById(post.id)
      .populate('user', ['username'])
      .populate({
        path: 'quotedPost',
        populate: {
          path: 'user',
          select: 'username',
        },
      });

    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', ['username'])
      .populate({
        path: 'quotedPost',
        populate: {
          path: 'user',
          select: 'username',
        },
      })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!post) {
      return res.status(401).json({
        msg: 'Post not found or user not authorized',
      });
    }

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.likes.some((like) => like.toString() === req.user.id)) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.user.id
      );
    } else {
      post.likes.unshift(req.user.id);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.repostPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (post.reposts.some((repost) => repost.toString() === req.user.id)) {
      post.reposts = post.reposts.filter(
        (repost) => repost.toString() !== req.user.id
      );
    } else {
      post.reposts.unshift(req.user.id);
    }

    await post.save();
    res.json(post.reposts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};