const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Conversation', ConversationSchema);

