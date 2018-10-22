const express = require('express')
const multer = require('multer')
const { MongoClient } = require('mongodb')
const client = new MongoClient('mongodb://localhost:27017')

const upload = multer({ dest: 'uploads/', preservePath: true })

const app = express()
const port = 3000

client.connect(err => {
  const db = client.db('local')
  const gameCollection = db.collection('games')

  app.get('/game/create', (req, res) => {
    const game = {
      _id: generateGameID(6),
    }
    gameCollection.insertOne(game)

    res.send(game)
  })

  // upload images
  app.post('/game/round', upload.single('image'), (req, res) => {
    res.send(req.file)
  })

  app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
  })
})

/**
 * @param {number} length Length of the id.
 * @returns A random id of the given length using only capital letters.
 */
function generateGameID(length) {
  const id = []
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * 26)
    id.push('A'.charCodeAt() + randomIndex)
  }
  return String.fromCharCode(...id)
}
