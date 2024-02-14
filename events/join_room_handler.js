const Room = require("../room");
const crypto = require("crypto");

module.exports = (socket, io, rooms) => {
  return (data) => {
    let room;
    const availableRoom = Object.values(rooms).find((room) => !room.isFull());
    if (availableRoom) {
      room = availableRoom;
      room.addPlayer({ id: data.sender, symbol: data.player });
      socket.join(room.roomId);
      io.to(room.roomId).emit("joinRoomResponse", {...data, roomId: room.roomId})
    } else {
      const roomId = crypto.randomBytes(8).toString("hex");
      room = new Room(roomId);
      room.addPlayer({ id: data.sender, symbol: data.player });
      socket.join(room.roomId);
      rooms[roomId] = room;
      io.to(room.roomId).emit("joinRoomResponse", {...data, roomId: room.roomId})
    }

    if (room.players.length === 1) {
      io.to(room.roomId).emit("waitingForOpponent");
    } else {
      io.to(room.roomId).emit("gameStart", true);
      io.to(room.roomId).emit("updateBoard", room.gameBoard);
      const randomPlayer = room.players[Math.floor(Math.random() * 2)];
      io.to(room.roomId).emit("handleTurns", randomPlayer.symbol);
    }
    console.log(room)
    console.log(`${data.player} joined the room: ${room.roomId}`);
  };
};
