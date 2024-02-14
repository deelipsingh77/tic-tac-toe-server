module.exports = (io, rooms) => {
    return ({ roomId, player, index }) => {
    if (rooms[roomId] && rooms[roomId].isMoveValid(index)) {
      rooms[roomId].makeMove(player, index, io);
    } else {
      console.log("Invalid move attempted");
    }
  }
}