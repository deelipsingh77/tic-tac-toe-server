module.exports = (socket, io, rooms) => {
    return ({ roomId }) => {
    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(
        (p) => p.id !== socket.id
      );
      rooms[roomId].turn = '';
      socket.leave(roomId);

      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit("opponentLeft");
        rooms[roomId].resetGame();
      }

      console.log(`${socket.id} left the room: ${roomId}`);
    }
  }
}