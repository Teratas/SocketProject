const express = require('express')
const { getMessages } = require('../controllers/message')
const Middleware = require('../lib/middleware')
const router = express.Router()

router.get('/get-messages', Middleware, getMessages)

module.exports = router