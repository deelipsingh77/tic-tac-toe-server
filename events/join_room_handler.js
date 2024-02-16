const Room = require("../room");
const crypto = require("crypto");

module.exports = (socket, io, rooms) => {
  return (data) => {
    let room =
      Object.values(rooms).find((room) => !room.isFull()) ||
      (() => {
        const roomId = crypto.randomBytes(8).toString("hex");
        const newRoom = new Room(roomId);
        rooms[roomId] = newRoom;
        return newRoom;
      })();

    const playerAssign = room.getAvailableSymbol();
    room.addPlayer({ id: data.sender, symbol: playerAssign });
    socket.join(room.roomId);
    io.to(room.roomId).emit("joinRoomResponse", {
      ...data,
      roomId: room.roomId,
      player: playerAssign,
    });

    if (room.players.length === 1) {
      io.to(room.roomId).emit("waitingForOpponent");
    } else {
      io.to(room.roomId).emit("gameStart", true);
      io.to(room.roomId).emit("updateBoard", room.gameBoard);
      const randomPlayer = room.players[Math.floor(Math.random() * 2)];
      io.to(room.roomId).emit("handleTurns", randomPlayer.symbol);
    }
    console.log(`${data.sender} joined the room: ${room.roomId}`);
  };
};
