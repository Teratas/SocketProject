const express = require('express');
const userController  = require('../controllers/userController');
// const { userService } = require("../services/userService");
const router = express.Router();
const Middleware = require('../lib/middleware');

// const userController = new UserController();

// Define routes
router.post('/register', (req, res) => userController.createUser(req, res));
router.post('/login', (req, res) => userController.login(req, res));
router.get('/', Middleware, (req, res) => userController.getUser(req, res));

module.exports = router;