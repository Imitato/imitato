const express = require('express')
const multer = require('multer')
const { MongoClient } = require('mongodb')

const mongoClient = new MongoClient('mongodb://localhost:27017')

const app = express()
const port = 3000
const router = express.Router()
const upload = multer({ dest: 'uploads/', preservePath: true })

const DUPLICATE_KEY_ERROR = 11000

mongoClient.connect(err => {
  const db = mongoClient.db('local')
  const gameCollection = db.collection('games')

  function createGame(callback) {
    const game = {
      _id: generateGameID(6),
      rounds: [],
    }
    gameCollection.insertOne(game, (error, obj) => {
      if (!error) {
        callback(error, game)
      } else {
        if (error.code == DUPLICATE_KEY_ERROR) {
          // try again if duplicate key
          createGame(callback)
        } else {
          callback(error)
        }
      }
    })
  }

  router.get('/game/create', (req, res) => {
    createGame((err, game) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(game)
      }
    })
  })

  router.get('/game/round/create', (req, res) => {
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
  router.post('/game/round/submit', upload.single('image'), (req, res) => {
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

  app.use('/imitato', router)

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
