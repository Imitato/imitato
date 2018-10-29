const express = require('express')
const { MongoClient } = require('mongodb')
const gameApi = require('./game_api')

const mongoClient = new MongoClient('mongodb://localhost:27017')

const app = express()
const port = 3000

mongoClient.connect(err => {
  const db = mongoClient.db('local')
  const gameCollection = db.collection('games')

  const gameRouter = gameApi(gameCollection)

  app.use('/imitato', gameRouter)

  app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
  })
})
