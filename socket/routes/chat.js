const express = require('express')
const { createChat, getDirectMessageChat, getGroupChat, joinGroupChat } = require('../controllers/chat')
const Middleware = require('../lib/middleware')
const router = express.Router()

router.post('/create-chat',Middleware, createChat)
router.post('/getDirectMessageChat',Middleware, getDirectMessageChat)
router.post('/getGroupMessageChat', Middleware, getGroupChat)
router.post('/join-group-chat', Middleware, joinGroupChat)

module.exports = router