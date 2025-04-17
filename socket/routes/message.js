const express = require('express')
const { getMessages, unsendMessage } = require('../controllers/message')
const Middleware = require('../lib/middleware')
const router = express.Router()

router.get('/get-messages', Middleware, getMessages)
router.put('/unsend-message', Middleware, unsendMessage)

module.exports = router