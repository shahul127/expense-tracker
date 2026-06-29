const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { chat, parseVoice } = require('../controller/aiController');

// Both routes require login — you don't want unauthenticated users burning your Gemini quota
router.post('/chat', verifyToken, chat);
router.post('/parse-voice', verifyToken, parseVoice);

module.exports = router;