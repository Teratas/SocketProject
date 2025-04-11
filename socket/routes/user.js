const express = require('express')
// const { handleLoginController, handleFetchById, handleFetchAll } = require('../controllers/user')
const router = express.Router()
const userController  = require('../controllers/userController');
const Middleware = require('../lib/middleware');
// router.post("/login", handleLoginController)
// router.get("/getById", handleFetchById)
// router.get('/allUser', handleFetchAll)
router.post('/register', (req, res) => userController.createUser(req, res));
router.post('/login', (req, res) => userController.login(req, res));
router.get('/', Middleware, (req, res) => userController.getUser(req, res));
router.get('/allUser', Middleware, (req, res) => userController.handleFetchAll(req, res))
module.exports = router;
