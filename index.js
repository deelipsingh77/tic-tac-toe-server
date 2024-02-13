const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

const EMPTY = null;

const rooms = {};

app.get("/", (req, res) => {
  res.send("Tic Tac Toe Server is running!");
});

io.on("connection", (socket) => {
  console.log("User Connected: ", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room.roomId);

    if (rooms[room.roomId]) {
      rooms[room.roomId].players.push(room.player);
      io.to(room.roomId).emit("gameStart", true);
      io.to(room.roomId).emit("updateBoard", rooms[room.roomId]["gameBoard"]);

      const randomIndex = Math.floor(Math.random()*2);
      const randomPlayer = rooms[room.roomId].players[randomIndex];
      io.to(room.roomId).emit("handleTurns", randomPlayer);
    } else {
      rooms[room.roomId] = {
        "gameBoard": Array(9).fill(EMPTY),
        "players": [room.player]
      }
    }
    console.log(`${room.sender} joined the room: ${room.roomId}`);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room.roomId);
    console.log(`${room} left the room: ${room.roomId}`);
  });

  socket.on("move", (move) => {
    if (isValidMove(rooms[move.roomId]["gameBoard"], move.index)) {
      rooms[move.roomId]["gameBoard"][move.index] = move.player;

      if (rooms[move.roomId]["moveHistory"]) {
        rooms[move.roomId]["moveHistory"].push(move);
      } else {
        rooms[move.roomId]["moveHistory"] = [move];
      }

      const winner = checkWinner(rooms[move.roomId]["gameBoard"]);
      const isDraw = checkDraw(rooms[move.roomId]["gameBoard"]);

      io.to(move.roomId).emit("updateBoard", rooms[move.roomId]["gameBoard"]);

      if (winner || isDraw) {
        io.to(move.roomId).emit("gameResult", { winner, isDraw }); // Emit to the specific room
        resetGame(rooms[move.roomId]);
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
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
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
  return !gameBoard.includes(EMPTY) && !checkWinner();
}

function resetGame(room) {
  room["gameBoard"] = Array(9).fill(EMPTY);
  room["moveHistory"].splice(0, room["moveHistory"].length);
}

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
