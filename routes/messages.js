const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendMessage,
  getConversations,
  getMessages,
} = require('../controllers/messageController');


router.post('/:receiverId', auth, sendMessage);


router.get('/conversations', auth, getConversations);


router.get('/conversation/:conversationId', auth, getMessages);

module.exports = router;