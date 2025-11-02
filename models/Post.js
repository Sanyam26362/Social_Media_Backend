const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: false,
    maxlength: 280,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },

 
  reposts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

 
  quotedPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    optional: true,
  },
});

module.exports = mongoose.model('Post', PostSchema);