const express = require('express')
const multer = require('multer')

const DUPLICATE_KEY_ERROR = 11000

module.exports = function(collection) {
  const router = express.Router()
  const upload = multer({ dest: 'uploads/', preservePath: true })

  router.get('/game', (req, res) => {
    const { id } = req.query
    collection
      .findOne({ _id: id })
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error))
  })

  router.get('/game/create', (req, res) => {
    createGame((err, game) => {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(200).send(game)
      }
    })
  })

  function createGame(callback) {
    const game = {
      _id: generateGameID(6),
      rounds: [],
    }
    collection.insertOne(game, (error, obj) => {
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

  router.get('/game/create_round', (req, res) => {
    const { gameId } = req.query
    collection
      .findOneAndUpdate(
        { _id: gameId },
        {
          $push: {
            rounds: {
              $each: [{ submissions: [] }],
              $position: 0,
            },
          },
        },
        { returnOriginal: false }
      )
      .then(result => {
        const {
          lastErrorObject: { updatedExisting },
          value,
        } = result

        if (updatedExisting) res.status(200).send(value)
        else res.status(400).send(`Game ${gameId} not found.`)
      })
      .catch(error => res.status(400).send(error))
  })

  router.get('/game/start_round', (req, res) => {
    const { gameId } = req.query
    collection
      .findOneAndUpdate(
        { _id: gameId },
        { $set: { roundInProgress: true } },
        { returnOriginal: false }
      )
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error))
  })

  router.get('/game/end_round', (req, res) => {
    const { gameId } = req.query
    collection
      .findOneAndUpdate(
        { _id: gameId },
        { $set: { roundInProgress: false } },
        { returnOriginal: false }
      )
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error))
  })

  // upload images
  router.post('/game/round/submit', upload.single('image'), (req, res) => {
    const imageFile = req.file
    const { userId, gameId, round } = req.body
    collection.updateOne(
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

  return router
}

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
