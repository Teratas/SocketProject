const socket = require("socket.io");

let connectedPeer = []; //{username, socketID}
let io = null;
const initSocket = (server) => {
  io = new socket.Server(server, {
    cors: {
      origin: "*",
    },
  });
  console.log("Socket.IO server initialized");
  io.on("connection", (socket) => {
    socket.on("register-user", ({ socketID, username }) => {
      connectedPeer.push({ username: username, socketID: socketID });
      console.log("User Join in " + socketID);
      console.log("connectedPeer");
    });
    socket.on("room-message", (data) => {
      const { roomId } = data;

      io.to(roomId).emit("room-message", data);
    });
    socket.on("disconnect", () => {
      console.log("user disconnect");
      connectedPeer = connectedPeer.filter(
        (socketID) => socketID !== socket.id
      );
    });
  });
};
module.exports = { initSocket, connectedPeer, getIO: () => io };
