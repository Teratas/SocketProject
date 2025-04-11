const User = require('../models/User');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// dotenv.config();
// const { JWT_SECRET } = process.env;


class UserService {
    constructor() {
        console.log('UserService initialized');
    }

    async createUser(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            userData.password = hashedPassword;
            const newUser = await User.create(userData);
            return newUser;
        } catch (error) {
            throw new Error('Error creating user');
        }
    }

    async getUser(username) {
        try {
            console.log(username);
            const user = await User.findOne({ 'username': username });
            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
            throw new Error('Error fetching user');
        }
    }
}

const userService = new UserService();
module.exports = userService;
