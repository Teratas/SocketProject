const socket = require("socket.io");
const Message = require('../models/Message')
const Chat = require('../models/Chat')
let connectedPeer = {}; //{username, socketID}
let io = null;
const getSocket = (server) => {
  io = new socket.Server(server, {
    cors: {
      origin: "*",
    },
  });
  console.log("Socket.IO server initialized");
  io.on("connection", (socket) => {
    socket.on("register-user", (data) => {
      if(!data.id){
        return;
      }
      console.log("data",data)
      // connectedPeer.push({ username: data.username, socketID: data.socketID });
      connectedPeer[data.id] = {
        username : data.username,
        socketID : data.socketID
      }
      socket.emit('state', {
        success : true,
        msg: "Login Successful",
        data : data.username,
        type: "login"
      })
      io.emit("state", {
        success: true,
        msg : "Update peer",
        data : connectedPeer,
        type : "update-peer"
      });
      console.log("User Join with " + data.socketID);
      console.log("connectedPeer", connectedPeer);
    });
    socket.on('join-room', roomID => { // data : {participantID, roomID}
      socket.join(roomID)
    })
    socket.on("room-message", (data) => {
      const { roomId } = data;

      io.to(roomId).emit("room-message", data);
    });
    socket.on('update-chat-member', (data) => { // data : {chatID, participants}
      socket.join(data.chatID)
      console.log("data , ",data)
      io.to(data.chatID).emit("user-joined", {participants : data.participants,chatID : data.chatID})
    })
    socket.on('direct-message', async (data) => { // data : {chatId, sender, receiver, message} ให้ส่งไปหา client แล้ว client check จาก currentChat ว่าเปิดอยู่ไหมหาก chatID ตรงกันให้หรับไม่ใช่ช่างแม่งเพราะเพื่อ click ไปที่ chat แล้วจะ fetch มาเสมอ
      const {chatId, sender, receiver, message, isGroup, type} = data

      try{
        const newMessage = new Message({
          chatId : chatId,
          sender : sender,
          receiver: receiver,
          message : message,
          isGroup : isGroup,
          type: type
        })
        await newMessage.save()
        
        await newMessage.populate([
          { path: 'sender', select: 'username' },
          { path: 'receiver', select: 'username' }
        ]);

        await Chat.findByIdAndUpdate(chatId, {
          updatedAt: new Date(),
          lastMessage: newMessage.message,
          lastMessageAt: new Date()
        });
        if(!isGroup){
          if(Object.keys(connectedPeer).includes(sender)){
          
            const senderSocketID = connectedPeer[sender].socketID
            io.to(senderSocketID).emit('receive-message', newMessage)
          }
          if(Object.keys(connectedPeer).includes(receiver)){
            const receiverSocketID = connectedPeer[receiver].socketID
            io.to(receiverSocketID).emit('receive-message', newMessage)
          }
        }
        else{
          io.to(chatId).emit('receive-message', newMessage)
          console.log('emit to group chat')
        }
        
        console.log('newMessage', newMessage)

        console.log('Message saved and sent to both users');

      }catch(err){
        console.log(err)
      }
    })
    socket.on("disconnect", () => {
      let disconnectedUserID = null;
    
      for (const key in connectedPeer) {
        if (connectedPeer[key].socketID === socket.id) {
          disconnectedUserID = key;
        }
      }
    
      if (disconnectedUserID) {
        delete connectedPeer[disconnectedUserID];
        console.log("User disconnected:", disconnectedUserID);
    
        io.emit("state", {
          success: true,
          msg: "Update peer",
          data: connectedPeer,
          type: "update-peer",
        });
      }
    
      console.log("user disconnected: " + socket.id);
    });
  });
};
module.exports = { getSocket, connectedPeer, getIO: () => io };
