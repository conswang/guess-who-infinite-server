class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }

  selectCard(cardIdx) {
    this.selectedCard = cardIdx;
  }
}

module.exports = Player;
