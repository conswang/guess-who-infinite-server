class Game {

  constructor(player1, player1Id) {
    this.player1 = player1;
    this.playerId = player1Id;
    this.isOpen = true;
  }

  addPlayer(player2, player2Id) {
    this.player2 = player2;
    this.player2Id = player2Id;
    this.isOpen = false;
  }

}

module.exports = Game;
