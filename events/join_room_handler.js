const Room = require("../room");
const crypto = require("crypto");

module.exports = (socket, io, rooms) => {
  return (data) => {
    const availableRoom = Object.values(rooms).find((room) => !room.isFull());
    if (availableRoom) {
      room = availableRoom;
      const playerAssign = room.players[0].symbol == "X" ? "O" : "X";
      room.addPlayer({ id: data.sender, symbol: playerAssign });
      socket.join(room.roomId);
      io.to(room.roomId).emit("joinRoomResponse", {
        ...data,
        roomId: room.roomId,
        player: playerAssign,
      });
    } else {
      const roomId = crypto.randomBytes(8).toString("hex");
      room = new Room(roomId);
      const playerAssign = ["X", "O"][Math.floor(Math.random() * 2)];
      room.addPlayer({ id: data.sender, symbol: playerAssign });
      socket.join(room.roomId);
      rooms[roomId] = room;
      io.to(room.roomId).emit("joinRoomResponse", {
        ...data,
        roomId: room.roomId,
        player: playerAssign,
      });
    }

    if (room.players.length === 1) {
      io.to(room.roomId).emit("waitingForOpponent");
    } else {
      io.to(room.roomId).emit("gameStart", true);
      io.to(room.roomId).emit("updateBoard", room.gameBoard);
      const randomPlayer = room.players[Math.floor(Math.random() * 2)];
      io.to(room.roomId).emit("handleTurns", randomPlayer.symbol);
    }
    console.log(`${data.player} joined the room: ${room.roomId}`);
  };
};
