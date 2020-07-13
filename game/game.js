const Player = require('./player.js');

class Game {

  constructor(player1Name, player1Id, room, category, numOfCards) {
    this.player1 = new Player(player1Name, player1Id);
    this.room = room;
    this.category = category;
    this.isOpen = true;
    this.numOfCards = numOfCards;
  }

  // once second player is added then game has started
  addPlayer(player2Name, player2Id) {
    this.player2 = new Player(player2Name, player2Id);
    this.isOpen = false;
  }

  // helper method to get player 1 or player 2 by id
  getPlayer(id) {
    if (this.player1.id === id) {
      return this.player1;
    } else {
      return this.player2;
    }
  }

  // returns true if question and answer is ready to start
  selectCard(id, cardIdx) {
    this.getPlayer(id).selectCard(cardIdx);
    return this.player1.selectedCard != undefined && this.player2.selectedCard != undefined;
  }

  guess(id, cardIdx) {
    // player 1 guesses
    if (this.player1.id === id) {
      if (cardIdx === this.player2.selectedCard) {
        this.winnerId = this.player1.id
        return { guess: true, game: this };
      } else {
        this.winnerId = this.player2.id
        return { guess: false, game: this };
      }
    } else {
      // player 2 guesses
      if (cardIdx === this.player1.selectedCard) {
        this.winnerId = this.player2.id
        return { guess: true, game: this };
      } else {
        this.winnerId = this.player1.id
        return { guess: false, game: this };
      }
    }
  }

}

module.exports = Game;
