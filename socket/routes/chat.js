const express = require('express')
const { createChat, getDirectMessageChat } = require('../controllers/chat')
const Middleware = require('../lib/middleware')
const router = express.Router()

router.post('/create-chat',Middleware, createChat)
router.post('/getDirectMessageChat',Middleware, getDirectMessageChat)


module.exports = router