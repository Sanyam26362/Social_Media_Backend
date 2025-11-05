const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getMe,
  registerValidators,
  loginValidators,
} = require('../controllers/authController');

router.post('/register', registerValidators, registerUser);
router.post('/login', loginValidators, loginUser);
router.get('/me', auth, getMe);

module.exports = router;
