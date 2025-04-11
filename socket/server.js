const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const { initSocket } = require('./lib/socket');
const UserRouter = require('./routes/user');
dotenv.config()
const PORT = process.env.PORT || 5000
const app = express()
app.use(cors())
connectDB()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const server = app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
app.use('/users', userRouter)
app.use('/chats', chatRouter)
app.use('/messages', messageRouter)
app.use('/api/user', UserRouter)
app.get('/', (req, res) => {
getSocket(server)

