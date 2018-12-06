const path = require('path')

const { Server } = require('http')
const express = require('express')
const { MongoClient } = require('mongodb')
const gameApi = require('./game_api')
require('dotenv').config()

var ENV = {
  apiKey: process.env.AZURE_FACE_API_KEY,
  dbUser: process.env.DB_USERNAME,
  dbPass: process.env.DB_PASSWORD,
}

// local
// const dbUrl = 'mongodb://localhost:27017'
// mLab
const dbUrl = `mongodb://${ENV['dbUser']}:${ENV['dbPass']}@ds157740.mlab.com:57740/imitato`
const mongoClient = new MongoClient(dbUrl)

const app = express()
const server = Server(app)
const io = require('./game_socket')(server)

mongoClient.connect(err => {
  const db = mongoClient.db('imitato')
  const gameCollection = db.collection('games')
  console.log(dbUrl)

  // http://expressjs.com/en/starter/static-files.html
  app.use(express.static(path.join(__dirname, '/dist')))
  app.use(express.static(path.join(__dirname, '/assets')))

  // http://expressjs.com/en/starter/basic-routing.html
  app.get('/game', function(request, response) {
    response.sendFile(path.join(__dirname, '/dist/html/game.html'))
  })

  app.get('/game_test', function(request, response) {
    response.sendFile(path.join(__dirname, '/dist/html/game_test.html'))
  })

  app.get('/player', function(request, response) {
    response.sendFile(path.join(__dirname, '/dist/html/player.html'))
  })

  app.get('/images', function(request, response) {
    const { id } = request.query
    response.sendFile(path.join(__dirname, '../uploads/' + id))
  })

  const apiRouter = gameApi(gameCollection, ENV)
  app.use('/imitato', apiRouter)

  const port = 3000
  server.listen(port, () => console.log(`Listening on port ${port}.`))
})
