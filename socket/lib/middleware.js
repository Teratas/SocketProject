const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const envSecret = process.env.JWT_SECRET || 'secret';

const Middleware = (req, res, next) => {
    const token = req.headers['bearer']
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, envSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = Middleware;