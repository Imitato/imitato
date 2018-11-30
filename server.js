const express = require('express')
const { MongoClient } = require('mongodb')
const gameApi = require('./game_api')
var ENV = {
  apiKey: process.env.AZURE_FACE_API_KEY,
  dbUser: process.env.DB_USERNAME,
  dbPass: process.env.DB_PASSWORD
};

// local
// const dbUrl = 'mongodb://localhost:27017'
// mLab
const dbUrl = 'mongodb://'+ENV['dbUser']+':'+ENV['dbPass']+'@ds157740.mlab.com:57740/imitato'
const mongoClient = new MongoClient(dbUrl)

const app = express()
const port = 3000

mongoClient.connect(err => {
  const db = mongoClient.db('local')
  const gameCollection = db.collection('games')

  // http://expressjs.com/en/starter/static-files.html
  app.use(express.static('public'));

  // http://expressjs.com/en/starter/basic-routing.html
  app.get('/', function(request, response) {
    response.sendFile(__dirname + '/views/index.html');
  });

  app.get('/player', function(request, response) {
    response.sendFile(__dirname + '/views/player.html')
  });
  
  const gameRouter = gameApi(gameCollection)
  app.use('/imitato', gameRouter)

  app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
  })
})
