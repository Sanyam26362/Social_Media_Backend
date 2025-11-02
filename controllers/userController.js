const User = require('../models/User');


exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};


exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot follow yourself' });
    }

    if (
      currentUser.following.some(
        (follow) => follow.toString() === req.params.id
      )
    ) {
      return res.status(400).json({ msg: 'You are already following this user' });
    }

    currentUser.following.unshift(userToFollow.id);
    await currentUser.save();

    userToFollow.followers.unshift(currentUser.id);
    await userToFollow.save();

    res.json({ msg: 'User followed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (
      !currentUser.following.some(
        (follow) => follow.toString() === req.params.id
      )
    ) {
      return res.status(400).json({ msg: 'You are not following this user' });
    }

    currentUser.following = currentUser.following.filter(
      (follow) => follow.toString() !== req.params.id
    );
    await currentUser.save();

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower.toString() !== req.user.id
    );
    await userToUnfollow.save();

    res.json({ msg: 'User unfollowed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};