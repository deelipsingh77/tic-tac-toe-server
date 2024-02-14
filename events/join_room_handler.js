const Room = require("../room");

module.exports = (socket, io, rooms) => {
    return ({ roomId, player }) => {
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
  }
}