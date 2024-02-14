require('dotenv').config();
const { createServer } = require("http"); 
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = createServer(app); 
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 4000;
const EMPTY = null;
const rooms = {};

app.use(cors());

app.get("/", (req, res) => {
  res.send("Tic Tac Toe Server is running!");
});

io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on("join_room", (room) => {
    const { roomId, player } = room;
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        gameBoard: Array(9).fill(EMPTY),
        players: [player],
      };
    } else {
      rooms[roomId].players.push(player);
      io.to(roomId).emit("gameStart", true);
      io.to(roomId).emit("updateBoard", rooms[roomId].gameBoard);

      const randomIndex = Math.floor(Math.random() * 2);
      const randomPlayer = rooms[roomId].players[randomIndex];
      io.to(roomId).emit("handleTurns", randomPlayer);
    }

    console.log(`${player} joined the room: ${roomId}`);
  });

  socket.on("leave_room", (room) => {
    const { roomId } = room;
    socket.leave(roomId);
    console.log(`${socket.id} left the room: ${roomId}`);
  });

  socket.on("move", (move) => {
    const { roomId, player, index } = move;
    const gameBoard = rooms[roomId].gameBoard;

    if (isValidMove(gameBoard, index)) {
      gameBoard[index] = player;
      const winner = checkWinner(gameBoard);
      const isDraw = checkDraw(gameBoard);

      io.to(roomId).emit("updateBoard", gameBoard);

      if (winner || isDraw) {
        io.to(roomId).emit("gameResult", { winner, isDraw });
        resetGame(rooms[roomId]);
      }
    }

    console.log(rooms);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

function isValidMove(gameBoard, index) {
  return gameBoard[index] === EMPTY;
}

function checkWinner(gameBoard) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], 
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (
      gameBoard[a] &&
      gameBoard[a] === gameBoard[b] &&
      gameBoard[a] === gameBoard[c]
    ) {
      return gameBoard[a];
    }
  }

  return null;
}

function checkDraw(gameBoard) {
  return !gameBoard.includes(EMPTY) && !checkWinner(gameBoard); 
}

function resetGame(room) {
  room.gameBoard = Array(9).fill(EMPTY);
}

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
