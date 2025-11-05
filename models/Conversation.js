const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  ],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);