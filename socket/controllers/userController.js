const bcrypt = require("bcryptjs");
const User = require("../models/User");
const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
class UserController {
  constructor() {
    console.log("UserController initialized");
    this.envSecret = process.env.JWT_SECRET || "secret";
    // const userService = new UserService();
    // this.userService = userService
  }

  async createUser(req, res) {
    const userData = req.body;

    console.log(userData);

    const existingUser = await userService.getUser(userData.username);

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    try {
      const newUser = await userService.createUser(userData);
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUser(req, res) {
    const username = req.query.username

    try {
      const user = await userService.getUser(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async handleFetchAll(req, res) {
    try {
      const users = await User.find();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async login(req, res) {
    const { username, password } = req.body;
    try {
      const user = await userService.getUser(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ username: user.username }, this.envSecret, {
        expiresIn: "1h",
      });
      return res.status(200).json({ token, _id : user._id });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

// module.exports = UserController;
const userController = new UserController();
module.exports = userController;
