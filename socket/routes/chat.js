const express = require('express')
const { createChat, getDirectMessageChat, getGroupChat, joinGroupChat, changeChatName } = require('../controllers/chat')
const Middleware = require('../lib/middleware')
const router = express.Router()

router.post('/create-chat',Middleware, createChat)
router.post('/getDirectMessageChat',Middleware, getDirectMessageChat)
router.post('/getGroupMessageChat', Middleware, getGroupChat)
router.post('/join-group-chat', Middleware, joinGroupChat)
router.post('/change-name', Middleware, changeChatName)

module.exports = router