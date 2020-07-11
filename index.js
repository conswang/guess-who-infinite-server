const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const category = require('./routes/category');
const Game = require('./game/game.js');

const app = express();
// Bodyparser Middleware
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mongo
mongoose.connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err))

  // Use route
app.use('/api/category', category)

app.get('/', function (req, res) {
  res.send('Hello World!');
});

const server = app.listen(process.env.PORT || 5000, function () {
  console.log('Example app listening on port 5000!');
});

// ATTACH SOCKET IO TO SERVER

const io = require('socket.io')(server, { perMessageDeflate: false });

const roomToGameMap = new Map();

io.on('connection', client => {

  function getGameByClientId(id) {
    id.rooms.forEach(room => {
      if (roomToGameMap.has(room)) {
        return roomToGameMap.get(room);
      }
    });
  }

  client.on('createGame', function (name) {
    const numOfGames = roomToGameMap.size;
    const room = `ROOM${numOfGames}`;
    // create room and create the game
    client.join(room);
    roomToGameMap.set(room, new Game(name, client.id, room, 24));

    client.emit(room);

    console.log(roomToGameMap);
  });
  
  client.on('joinGame', function (name, room) {
    if (roomToGameMap.has(room)) {
      // join room and join the game
      client.join(room);
      let game = roomToGameMap.get(room);
      game.addPlayer(name, client.id);

      console.log(roomToGameMap);

    } else {
      // TODO: emit error to client: Join Code is invalid
    }
  });

  client.on('selectCard', function (cardIdx) {

  });

  client.on('ask', function (question) {

  });

  
  client.on('answer', function (isTrue) {

  });

  client.on('guess', function (cardIdx) {

  });

});