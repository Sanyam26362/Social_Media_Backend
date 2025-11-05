const asyncHandler = require('../middleware/asyncHandler');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');


exports.sendMessageValidators = [
  param('receiverId').isMongoId().withMessage('receiverId must be a valid ObjectId'),
  body('content').isString().trim().isLength({ min: 1 }).withMessage('Message content is required'),
  validate,
];

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { receiverId } = req.params;
  const senderId = req.user.id;

  if (receiverId === senderId) {
    return res.status(400).json({ msg: 'Cannot message yourself' });
  }

  const receiver = await User.findById(receiverId).lean();
  if (!receiver) return res.status(404).json({ msg: 'Receiver not found' });

  // ---- FIX: find-or-create (avoid upsert on the same array path) ----
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      lastMessageAt: Date.now(),
    });
  } else {
    conversation.lastMessageAt = Date.now();
    await conversation.save();
  }

  const newMessage = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content: content.trim(),
  });

  // Optional socket notify
  const { io, onlineUsers } = req.app.locals || {};
  const receiverSocketId = onlineUsers?.get(String(receiverId));
  if (io && receiverSocketId) {
    io.to(receiverSocketId).emit('newMessage', newMessage);
  }

  res.status(201).json(newMessage);
});


exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate('participants', ['username'])
    .populate({
      path: 'messages',
      populate: { path: 'sender', select: 'username' },
      options: { sort: { createdAt: -1 }, limit: 1 },
    })
    .sort({ lastMessageAt: -1 })
    .lean();

  res.json(conversations);
});

exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user.id,
  }).lean();

  if (!conversation) return res.status(403).json({ msg: 'Not authorized to view this conversation' });

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', ['username'])
    .populate('receiver', ['username'])
    .sort({ createdAt: 1 })
    .lean();

  res.json(messages);
});
