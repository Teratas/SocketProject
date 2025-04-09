const express = require('express')
const router = express.Router()

router.post("/login", handleLoginController)

module.exports = router