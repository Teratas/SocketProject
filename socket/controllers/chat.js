const { ObjectId } = require("mongodb");
const Chat = require("../models/Chat");
const { connectedPeer } = require("../lib/socket");

/*
isGroup: { type: Boolean, default: false }, 
  name: { type: String },                     
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
*/

exports.getDirectMessageChat = async (req, res, next) => {
  try {
    const { userID } = req.body;
    const chats = await Chat.find({
      participants: { $in: [userID] },
    }).sort({lastMessageAt : -1}).populate("participants", "username");
    if (!chats) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch chat",
      });
    }
    res.status(200).json({
      success: true,
      chats,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getGroupChat = async (req, res, next) => {
  try {
    const { userID } = req.body;
    console.log('userID get Group Chat', userID)
    const chats = await Chat.find({
      participants: { $nin: [userID] },
      isGroup: true
    }).populate("participants", "username");

    return res.status(200).json(chats);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.joinGroupChat = async (req, res, next) => {
  try {
    const { chatID, userID } = req.body;

    const groupChat = await Chat.findById(chatID);
    if (!groupChat) {
      return res.status(404).json({success: false, message: "Chat not found" });
    }
    const isJoined = groupChat.participants.some(participant =>
      participant.equals(userID)
    );

    if (isJoined) {
      return res.status(400).json({success: false, message: "User already in the group chat" });
    }
    groupChat.participants.push(userID);
    await groupChat.save();
    await groupChat.populate('participants', 'username')
    return res.status(200).json({success: true, message: "User added to group chat", chat: groupChat });

  } catch (err) {
    console.error(err);
    return res.status(500).json({success: false, message: "Internal server error" });
  }
};

exports.createChat = async (req, res, next) => {
  try {
    console.log(req.body);

    const { name, participants, isGroup, userID } = req.body;
    console.log('isGroup', isGroup)
    if(!isGroup){
      console.log('isGroup False userID : ' + userID)
      const targetUserID = participants[0] == userID ? participants[1] : participants[0]
      const findChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [userID, targetUserID] }
      });      
      if(findChat){
        return res.status(200).json({
          success: false,
          message: "Already has direct chat with this user"
        })
      }
    }
    console.log("participants", participants);
    const objectIds = participants.map(
      (participant) => new ObjectId(participant)
    );
    let chat = null
    if(!isGroup){
      const roomID = [...participants].sort().join("-")
      const findChat = await Chat.findOne({name : roomID})
      if(findChat){
        return res.status(200).json({
          success: true,
          findChat,
        });
      }
      chat = await Chat.create({
        name: roomID,
        participants: objectIds,
        isGroup: isGroup,
      });
      
    }else{
      chat = await Chat.create({
        name: name,
        participants: objectIds,
        isGroup: isGroup,
      });
    }
    
    // const findChat = await Chat.find({name : name, participants : {$in : [userID]}})
    // if(findChat){
    //   return res.status(200).json({
    //     success : false,
    //     message : "Already has room with this name"
    //   })
    // }
    // chat = await Chat.create({
    //   name: isGroup ? name : roomID,
    //   participants: objectIds,
    //   isGroup: isGroup,
    // });
    if (!chat) {
      return res.status(401).json({
        success: false,
        message: "Failed to create chat",
      });
    }
    await chat.populate('participants', 'username')
    const socket = require("../lib/socket");
    const io = socket.getIO();
    // if(!isGroup){
    // participants.forEach((participant) => {
    //   // console.log('io', io)
    //   if (Object.keys(connectedPeer).includes(participant)) {
    //     io.to(connectedPeer[participant].socketID).emit("update-chat", "");
    //     console.log("sent to socket " + connectedPeer[participant].socketID);
    //   }
    // });
    io.emit('update-chat', chat)
    // }
    // else{
    //   io.to(name).emit('update-chat', chat)
    //   console.log('chat group ' + chat)
    //   console.log("Sent to Room " + name)
    // }
    
    res.status(200).json({
      success: true,
      chat,
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.changeChatName = async (req, res, next) => {
  try {
    console.log(req.body);

    const {chatID, userID, newName} = req.body
    const groupChat = await Chat.findById(chatID);
    console.log(groupChat)
    if (!groupChat) {
      return res.status(404).json({success: false, message: "Chat not found" });
    }
    const isJoined = groupChat.participants.some(participant =>
      participant.equals(userID)
    );
    console.log(isJoined)
    // prevent unrelated person to change group name
    if (!isJoined) {
      return res.status(400).json({success: false, message: "User can't change name of group chat they are not in" });
    }
    if (groupChat.name === newName) {
      return res.status(400).json({success: false, message: "The new name is equivalent to old name of the group chat" });
    }
    groupChat.name = newName.toString();
    await groupChat.save();
    console.log(groupChat)
    await groupChat.populate('participants', 'username')

    const socket = require("../lib/socket");
    const io = socket.getIO();
    // if(!isGroup){
    io.emit('update-chat', groupChat)
    // groupChat.participants.forEach((participant) => {
    //   // console.log('io', io)
    //   if (Object.keys(connectedPeer).includes(participant)) {
    //     io.to(connectedPeer[participant].socketID).emit("update-chat", "");
    //     console.log("sent to socket " + connectedPeer[participant].socketID);
    //   }
    // });

    return res.status(200).json({success: true, message: `Name is changed to ${newName}`, chat: groupChat });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" })
  }
}