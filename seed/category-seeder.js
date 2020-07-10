const mongoose = require('mongoose');
const Category = require('../models/Category');
const db = require('../config/keys').mongoURI;

const data = [
    { 
        name: 'dogs', images: ['https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg', 'https://www.humanesociety.org/sites/default/files/styles/1240x698/public/2019/02/dog-451643.jpg?h=bf654dbc&itok=MQGvBmuo', 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg'] 
    },
    {
        name: 'cats', images: ['https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg', 'https://www.humanesociety.org/sites/default/files/styles/1240x698/public/2019/02/dog-451643.jpg?h=bf654dbc&itok=MQGvBmuo', 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg']
    }
]

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

async function seedCategory(data) {
    for(let i = 0; i < data.length; i++) {
        try {
            const newName = await Category.create({
                name: data[i].name,
                images: data[i].images,
            })
        } catch(e) {
            console.log(e.message);
            continue;
        }
    }
  }
  
  seedCategory(Data)
    .then(() => {
      mongoose.disconnect();
    })