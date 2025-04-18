const { ObjectId } = require("mongodb");
const Message = require("../models/Message");
const { connectedPeer } = require("../lib/socket");

exports.getMessages = async (req, res, next) => {
  try {
    const chatId = req.query.chatId;
    console.log("chatId", chatId);
    const chatObjectId = new ObjectId(chatId);
    const messages = await Message.find({ chatId: chatObjectId })
      .populate("sender", "username")
      .populate("receiver", "username");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.unsendMessage = async (req, res, next) => {
  try {
    const { userID, messageID } = req.body;
    // Validate messageID and userID
    if (!ObjectId.isValid(messageID) || !ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid messageID or userID",
      });
    }
    const messageObjectId = new ObjectId(messageID);
    const userObjectId = new ObjectId(userID);

    const message = await Message.findOne({ _id: messageObjectId });
    console.log("Got message", message);
    console.log("Got", message.sender._id);
    console.log("Reqbody", userObjectId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    if (message.sender._id.toString() != userID || message.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: "You can only unsend your manually inputted messages.",
      });
    }

    if (message.isUnsent) {
      return res.status(400).json({
        success: false,
        message: "You cannot unsend a message that has been unsent."
      })
    }

    message.message = "This message has been unsent by the user.";
    message.isUnsent = true;
    await message.save();

    await message.populate([
      { path: 'sender', select: 'username' },
      { path: 'receiver', select: 'username' }
    ]);
    console.log("After Populate",message)
    const socket = require("../lib/socket");
    const io = socket.getIO();
    console.log(connectedPeer);
    console.log('mressage', message)
    if (!message.isGroup) {
      
      if (connectedPeer[message.sender._id.toString()]) {
        console.log('test1')
        const senderSocketID = connectedPeer[message.sender._id.toString()].socketID;
        io.to(senderSocketID).emit("unsend-message", message);
      }
      if (connectedPeer[message.receiver._id.toString()]) {
        const receiverSocketID = connectedPeer[message.receiver._id.toString()].socketID;
        io.to(receiverSocketID).emit("unsend-message", message);
      }
    } else {
      io.to(message.chatId.toString()).emit("unsend-message", message);
      console.log("emit to group chat", message.chatId);
    }
    
    console.log("Unsent Message, now:", {
            message: message,
            messageId: messageID,
          });

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (err) {
    console.log(err);
  }
};
