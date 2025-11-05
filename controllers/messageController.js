const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');


exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user.id;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ msg: 'Receiver not found' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: content,
    });

    conversation.messages.push(newMessage._id);
    conversation.lastMessageAt = Date.now();

    await Promise.all([conversation.save(), newMessage.save()]);

   
    const { io, onlineUsers } = req.app.locals;

    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', ['username'])
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'username',
        },
        options: { sort: { createdAt: -1 }, limit: 1 } 
      })
      .sort({ lastMessageAt: -1 });
    
    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(403).json({ msg: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate('sender', ['username'])
      .populate('receiver', ['username'])
      .sort({ createdAt: 1 }); 

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};