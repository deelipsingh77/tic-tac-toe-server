require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;

const rooms = {};

app.use(cors());

app.get("/", (req, res) => {
  res.send("Tic Tac Toe Server is running!");
});

io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on(
    "join_room",
    require("./events/join_room_handler")(socket, io, rooms)
  );
  socket.on(
    "leave_room",
    require("./events/leave_room_handler")(socket, io, rooms)
  );
  socket.on("move", require("./events/move_handler")(io, rooms));

  socket.on("disconnect", () => {
    const currentRoom = Object.values(rooms).find((room)=>{
      return room.players.find((player)=>player.id === socket.id)
    })
    if (currentRoom) {
      socket.leave(currentRoom.roomId);
      io.to(currentRoom.roomId).emit("opponentLeft");
      console.log(`${socket.id} left the room: ${currentRoom.roomId}`);
      delete rooms[currentRoom.roomId];
    }
    console.log(`${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
