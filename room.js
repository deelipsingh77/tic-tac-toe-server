class Room {
  constructor(roomId) {
    this.roomId = roomId;
    this.gameBoard = Array(9).fill(null);
    this.players = [];
  }

  getAvailableSymbol() {
    if (this.players.length === 0) {
      return ["X", "O"][Math.floor(Math.random() * 2)];
    } else {
      const existingSymbol = this.players[0].symbol;
      return existingSymbol === "X" ? "O" : "X";
    }
  }

  getRandomPlayer(){
    return this.players[Math.floor(Math.random() * 2)].symbol;
  }

  isFull() {
    return this.players.length === 2;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  isMoveValid(index) {
    return this.gameBoard[index] === null;
  }

  makeMove(player, index, io) {
    this.gameBoard[index] = player;
    const winner = this.getWinner();
    const isDraw = this.checkDraw();

    io.to(this.roomId).emit("updateBoard", this.gameBoard);

    if (winner || isDraw) {
      io.to(this.roomId).emit("gameResult", { winner, isDraw });
      this.resetGame();
    }
  }

  getWinner() {
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
        this.gameBoard[a] !== null &&
        this.gameBoard[a] === this.gameBoard[b] &&
        this.gameBoard[a] === this.gameBoard[c]
      ) {
        return this.gameBoard[a];
      }
    }

    return null;
  }

  checkDraw() {
    return !this.gameBoard.some((cell) => cell === null) && !this.getWinner();
  }

  resetGame() {
    this.gameBoard = Array(9).fill(null);
  }
}

module.exports = Room;
