const express = require('express')
const router = express.Router()
const messageController = require('../controllers/message')

router.post('/send' , messageController.sendMessage)
router.get('/chat/:senderId/:receiverId' , messageController.getMessages)

module.exports = router