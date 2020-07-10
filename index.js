const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const category = require('./routes/category');

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

app.listen(process.env.PORT || 5000, function () {
  console.log('Example app listening on port 5000!');
});