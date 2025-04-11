const express = require('express')
const { getMessages } = require('../controllers/message')
const router = express.Router()

router.get('/get-messages', getMessages)

module.exports = router