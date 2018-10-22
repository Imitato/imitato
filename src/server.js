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
      rounds: [],
    }
    gameCollection.insertOne(game, (err, obj) => {
      const { ok, n } = obj.result
      if (ok == 1) {
        if (n == 1) res.status(200).send(game)
        else res.status(400).send('Could not create game.')
      } else {
        res.status(400).send('Update not OK.')
      }
    })
  })

  app.get('/game/round/create', (req, res) => {
    const { gameId } = req.query
    gameCollection.updateOne(
      { _id: gameId },
      { $push: { rounds: [] } },
      (err, obj) => {
        const { ok, n } = obj.result
        if (ok == 1) {
          if (n == 1) res.status(200).send('New round created.')
          else res.status(400).send(`Game ${gameId} not found.`)
        } else {
          res.status(400).send('Update not OK.')
        }
      }
    )
  })

  // upload images
  app.post('/game/round/submit', upload.single('image'), (req, res) => {
    const imageFile = req.file
    const { userId, gameId, round } = req.body
    gameCollection.updateOne(
      { _id: gameId },
      {
        $push: {
          [`rounds.${round}`]: {
            userId,
            image: imageFile.path,
          },
        },
      },
      (err, obj) => {
        const { ok, n } = obj.result
        if (ok == 1) {
          if (n == 1) res.status(200).send(imageFile)
          else res.status(400).send(`Game ${gameId} not found.`)
        } else {
          res.status(400).send('Update not OK.')
        }
      }
    )
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
