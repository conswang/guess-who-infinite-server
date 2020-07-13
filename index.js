const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const category = require('./routes/category');
const Game = require('./game/game.js');
const Scraper = require('images-scraper');

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

// image scraping----------------------------------------------

const google = new Scraper({
  puppeteer: {
    headless: false,
  }
});

// make request to /api/images/bananas to search bananas
app.get('/api/images/:searchstring', function (req, res) {
  google.scrape(req.params.searchstring, 24)
    .then(results => {
      let mappedResults = results.map(image => { return { img: image.url, selected: false }});
      res.send(mappedResults);
    });
})

const server = app.listen(process.env.PORT || 5000, function () {
  console.log('Example app listening on port 5000!');
});

// ATTACH SOCKET IO TO SERVER

const io = require('socket.io')(server, { perMessageDeflate: false });

const roomToGameMap = new Map();

io.on('connection', client => {

  console.log(`New client connected with id ${client.id}`)

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

      console.log(`JOIN GAME: game has started`);

    } else {
      // TODO: emit error to client: Join Code is invalid
      console.log('JOIN GAME: invalid join code - player did not join.');
    }

    console.log(roomToGameMap);
  });

  client.on('selectCard', function (cardIdx) {
    let game = getGameByClient(client);
    if (game) {
      const canStartQuestions = game.selectCard(client.id, cardIdx);

      if (canStartQuestions) {
        // tell both players questions have started
        io.in(game.room).emit('startedQuestions');
        console.log('SELECT CARD: Both players selected cards - can start questions');
      } else {
        client.emit('waitingForSelection');
        console.log('SELECT CARD: One player selected card - waiting for other player before starting questions');
      }
      console.log(roomToGameMap);
    } else {
      console.log(`SELECT CARD: Invalid client id ${client.id}`)
    }
  });

  // emits 'ask' | 'wait' back to client
  client.on('getTurn', function () {
    let game = getGameByClient(client);
    if (game) {
      if (client.id === game.player1.id) {
        client.emit('turn', 'ask');
      } else {
        client.emit('turn', 'wait');
      }
    } else {
      console.log(`GET TURN: Invalid client id ${client.id}`)
    }
  });

  client.on('ask', function (question) {
    let game = getGameByClient(client);
    if (game) {
      // emit question to other player only
      client.to(game.room).emit('playerAsked', question);
    } else {
      console.log(`ASK: Invalid client id ${client.id}`)
    }
  });
  
  client.on('answer', function (isTrue) {
    let game = getGameByClient(client);
    if (game) {
      // emit answer to other player only
      client.to(game.room).emit('playerAnswered', isTrue);
    } else {
      console.log(`ANSWER: Invalid client id ${client.id}`)
    }
  });

  client.on('guess', function (cardIdx) {
    let game = getGameByClient(client);
    if (game) {
      let result = game.guess(client.id, cardIdx);
      // emit result to both players in form { winner: 'bob'; guess: 'correct' }
      io.in(game.room).emit('gameEnded', result);
    } else {
      console.log(`GUESS: Invalid client id ${client.id}`)
    }
  });

});
