const express = require('express')
const multer = require('multer')
const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

var ENV = {
  apiKey: process.env.AZURE_FACE_API_KEY,
  dbUser: process.env.DB_USERNAME,
  dbPass: process.env.DB_PASSWORD,
}

const DUPLICATE_KEY_ERROR = 11000

const EMOTIONS = [
  'anger',
  'contempt',
  'disgust',
  'fear',
  'happiness',
  'neutral',
  'sadness',
  'surprise',
]

const NO_EMOTION = {
    'anger': 0,
    'contempt': 0,
    'disgust': 0,
    'fear': 0,
    'happiness': 0,
    'neutral': 0,
    'sadness': 0,
    'surprise': 0,
}

module.exports = function(collection, ENV) {
  const router = express.Router()
  const upload = multer({ dest: 'uploads/', preservePath: true })

  router.get('/test', (req, res) => {
    collection
      .find()
      .toArray()
      .then(result => res.status(200).send(result))
      .catch(error => res.status(400).send(error.message))
  })

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
      roundInProgress: false,
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

  router.get('/game/exists', (req, res) => {
    const { gameId } = req.query
    collection.findOne({ _id: gameId }).then(game => {
      if (game == null) {
        res.status(200).send(`false`)
      } else {
        res.status(200).send(`true`)
      }
    })
  })

  router.get('/game/create_round', (req, res) => {
    const { gameId } = req.query

    collection.findOne({ _id: gameId }).then(game => {
      if (game.roundInProgress) {
        res.status(400).send(`Game ${gameId} already a has a round running.`)
        return
      }
    })

    let rand_emotions = generateEmotions()
      .split('')
      .map(item => parseInt(item, 10))
    let total = rand_emotions.reduce((acc, num) => acc + num)
    rand_emotions = rand_emotions.map(item => item / total)

    let emotions_map = {}

    for (let i = 0; i < EMOTIONS.length; i++) {
      emotions_map[EMOTIONS[i]] = rand_emotions[i]
    }

    const round = { submissions: [], emotions_map }
    collection
      .findOneAndUpdate(
        { _id: gameId },
        {
          $push: {
            rounds: {
              $each: [round],
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
    const { playerId, gameId } = req.query

    processImage(imageFile).then(emotion_results => {
      collection.findOne({ _id: gameId }).then(game => {
        let lastRound = game.rounds.length - 1
        let emotions_map = game.rounds[lastRound].emotions_map

        // only let a user send 1 photo per round
        for (let submission of game.rounds[lastRound].submissions) {
          if (submission['playerId'] == playerId) {
            res.status(400).send('Photo already submitted!')
            return
          }
        }
        // do not let users send photo after end of round
        if (!game.roundInProgress) {
          res.status(400).send('The round has ended already.')
          return
        }

        let score = 0
        if (emotion_results == null) {
          for (let i = 0; i < EMOTIONS.length; i++) {
            emotion_results[EMOTIONS[i]] = 0
          }
        } else {
          for (let key in emotions_map) {
            score += emotions_map[key] * emotion_results[key]
          }
        }

        collection.updateOne(
          { _id: gameId },
          {
            $push: {
              [`rounds.${lastRound}.submissions`]: {
                playerId,
                image: imageFile.path,
                emotions: emotion_results,
                score,
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
    })
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

/**
 * @returns A random bitstring of length 8, where each digit corresponds
 * to the emotions that the players need to show.
 */
function generateEmotions() {
  let number = Math.floor(Math.random() * 256).toString(2)
  return '00000000'.substr(number.length) + number
}

function processImage(imageFile) {
  // Replace with valid subscription key.

  const subscriptionKey = ENV['apiKey']

  // NOTE: You must use the same region in your REST call as you used to
  // obtain your subscription keys. For example, if you obtained your
  // subscription keys from westus, replace "westcentralus" in the URL
  // below with "westus".
  //
  // Free trial subscription keys are generated in the westcentralus region.
  // If you use a free trial subscription key, you shouldn't need to change
  // this region.
  const hostName =
    'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect'
  var path = ''

  // Request parameters.
  const params = {
    returnFaceId: 'true',
    returnFaceLandmarks: 'false',
    returnFaceAttributes: 'emotion',
  }

  // Converts params into Uri string
  path += Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  // Perform the REST API call.
  const postData = imageFile.path
  const options = {
    hostname: hostName,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
  }

  let img = fs.readFileSync(postData)
  return axios({
    method: 'POST',
    url: hostName,
    headers: options['headers'],
    params: params,
    data: img,
  })
    .then(function(response) {
      return response.data.length == 0 ? NO_EMOTION : response.data[0].faceAttributes.emotion
    })
    .catch(function(error) {
      console.log(error)
    })
}
