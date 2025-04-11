const { ObjectId } = require('mongodb')
const Message = require('../models/Message')

exports.getMessages = async (req, res, next) => {
    try{
        const chatId = req.query.chatId
        console.log('chatId', chatId)
        const chatObjectId =new ObjectId(chatId)
        const messages = await Message.find({chatId : chatObjectId}).populate('sender', 'username').populate('receiver', 'username')

        res.status(200).json({
            success : true,
            data : messages
        })
    }catch(err){
        console.log(err)
    }
}