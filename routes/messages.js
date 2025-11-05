const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param } = require('express-validator');
const {
  sendMessage,
  getConversations,
  getMessages,
  sendMessageValidators,
} = require('../controllers/messageController');

router.post('/:receiverId', auth, sendMessageValidators, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/conversation/:conversationId', auth, [param('conversationId').isMongoId(), validate], getMessages);

module.exports = router;
