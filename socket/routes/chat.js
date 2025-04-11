const express = require('express')
const { createChat, getDirectMessageChat } = require('../controllers/chat')
const router = express.Router()

router.post('/create-chat', createChat)
router.post('/getDirectMessageChat', getDirectMessageChat)


module.exports = router