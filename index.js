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

  function getGameByClient(client) {
    const rooms = Object.keys(client.rooms);
    let foundRoom;
    rooms.forEach(room => {
      if (roomToGameMap.has(room)) {
        foundRoom = roomToGameMap.get(room);
      }
    });
    return foundRoom;
  }

  client.on('createGame', function (name) {
    const numOfGames = roomToGameMap.size;
    const room = `ROOM${numOfGames}`;
    // create room and create the game
    client.join(room);
    roomToGameMap.set(room, new Game(name, client.id, room, 24));

    // emit the room's code back!
    client.emit('createdGame', room);

    console.log(roomToGameMap);
  });
  
  client.on('joinGame', function (name, room) {
    if (roomToGameMap.has(room)) {
      // join room and join the game
      client.join(room);
      let game = roomToGameMap.get(room);
      game.addPlayer(name, client.id);

      // tell both players game has started
      io.in(room).emit('startedGame');

    } else {
      // TODO: emit error to client: Join Code is invalid
    }

    console.log(roomToGameMap);
  });

  client.on('selectCard', function (cardIdx) {
    let game = getGameByClient(client);
    const canStartQuestions = game.selectCard(client.id, cardIdx);

    if (canStartQuestions) {
      client.emit('startedQuestions');
    } else {
      client.emit('waitingForSelection');
    }

    console.log(roomToGameMap);
  });

  client.on('ask', function (question) {
    let room = getGameByClient(client).room;
    // emit question to other player only
    client.to(room).emit('playerAsked', question);
  });
  
  client.on('answer', function (isTrue) {
    let room = getGameByClient(client).room;
    // emit answer to other player only
    client.to(room).emit('playerAnswered', isTrue);
  });

  client.on('guess', function (cardIdx) {

  });

});