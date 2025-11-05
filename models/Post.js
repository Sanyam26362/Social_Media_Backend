const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, maxlength: 280 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    quotedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Post', PostSchema);
