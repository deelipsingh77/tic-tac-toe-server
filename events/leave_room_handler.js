module.exports = (socket, io, rooms) => {
  return ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(
        (p) => p.id !== socket.id
      );
      rooms[roomId].turn = "";
      socket.leave(roomId);

      delete rooms[roomId];
      io.to(roomId).emit("opponentLeft");

      console.log(`${socket.id} left the room: ${roomId}`);
    }
  };
};
