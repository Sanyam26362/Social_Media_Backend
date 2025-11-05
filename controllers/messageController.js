const asyncHandler = require('../middleware/asyncHandler');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessageValidators = [
  param('receiverId').isMongoId(),
  body('content').isString().isLength({ min: 1 }),
  validate,
];

exports.sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { receiverId } = req.params;
  const senderId = req.user.id;

  const receiver = await User.findById(receiverId).lean();
  if (!receiver) return res.status(404).json({ msg: 'Receiver not found' });

  const conversation = await Conversation.findOneAndUpdate(
    { participants: { $all: [senderId, receiverId] } },
    {
      $setOnInsert: { participants: [senderId, receiverId] },
      $set: { lastMessageAt: Date.now() },
    },
    { upsert: true, new: true }
  );

  const newMessage = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
  });

  const { io, onlineUsers } = req.app.locals || {};
  const receiverSocketId = onlineUsers?.get(receiverId);
  if (io && receiverSocketId) io.to(receiverSocketId).emit('newMessage', newMessage);

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
