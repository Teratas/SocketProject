const express= require('express')
const PORT = 5000
const cors = require('cors')
const connectDB = require('./config/db')
const app = express()
const dotenv = require("dotenv");
const { initSocket } = require('./lib/socket')
app.use(cors())
dotenv.config()
connectDB()
const server = app.listen(PORT, () => {
    console.log('Server running on http://localhost:5000');
});
initSocket(server)

