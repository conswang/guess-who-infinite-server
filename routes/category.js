  
const express = require('express');
const router = express.Router();

const Category = require('../models/Category');

router.get('/', (req, res) => {
    Category.find()
    .then(category => res.json(category));
})

module.exports = router;