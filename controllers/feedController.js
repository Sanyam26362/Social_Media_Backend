const Post = require('../models/Post');
const User = require('../models/User');


exports.getFollowingFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const followingList = user.following;

    followingList.push(req.user.id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: { $in: followingList } })
      .populate('user', ['username'])
      .populate({
        path: 'quotedPost',
        populate: {
          path: 'user',
          select: 'username',
        },
      })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);

   

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};