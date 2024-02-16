module.exports = (socket, io, rooms) => {
  return ({ roomId }) => {
    if (rooms[roomId]) {
      socket.leave(roomId);
      io.to(roomId).emit("opponentLeft");
      delete rooms[roomId];

      console.log(`${socket.id} left the room: ${roomId}`);
    }
  };
};
