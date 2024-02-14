require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const Room = require("./room")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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

  socket.on("join_room", ({ roomId, player }) => {
    const room = rooms[roomId] || new Room(roomId);

    if (!room.isFull()) {
      room.addPlayer(player);
      socket.join(roomId);
      rooms[roomId] = room;

      if (room.players.length === 1) {
        io.to(roomId).emit("waitingForOpponent");
      } else {
        io.to(roomId).emit("gameStart", true);
        io.to(roomId).emit("updateBoard", room.gameBoard);
        const randomPlayer = room.players[Math.floor(Math.random() * 2)];
        io.to(roomId).emit("handleTurns", randomPlayer);
      }
    } else {
      socket.emit("roomFull");
    }

    console.log(`${player} joined the room: ${roomId}`);
  });

  socket.on("leave_room", ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(
        (p) => p !== socket.id
      );
      socket.leave(roomId);

      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit("opponentLeft");
      }

      console.log(`${socket.id} left the room: ${roomId}`);
    }
  });

  socket.on("move", ({ roomId, player, index }) => {
    if (rooms[roomId] && rooms[roomId].isMoveValid(index)) {
      rooms[roomId].makeMove(player, index);
    } else {
      console.log("Invalid move attempted");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
