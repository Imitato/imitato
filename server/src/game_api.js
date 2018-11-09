const express = require('express')
const multer = require('multer')
const axios = require('axios')
const fs = require('fs')
const keys = require('./creds.json')

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
    const round = { submissions: [] }
    collection
      .findOneAndUpdate(
        { _id: gameId },
        {
          $push: {
            rounds: {
              $each: [round],
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

    processImage(imageFile).then(results => {
      collection.updateOne(
        { _id: gameId },
        {
          $push: {
            [`rounds.${round}.submissions`]: {
              userId,
              image: imageFile.path,
              emotions: results
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
    });
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

function processImage(imageFile) {
  // Replace with valid subscription key.

  const subscriptionKey = keys['api_key'] 

  // NOTE: You must use the same region in your REST call as you used to
  // obtain your subscription keys. For example, if you obtained your
  // subscription keys from westus, replace "westcentralus" in the URL
  // below with "westus".
  //
  // Free trial subscription keys are generated in the westcentralus region.
  // If you use a free trial subscription key, you shouldn't need to change 
  // this region.
  const hostName = 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect';
  var path = "";

  // Request parameters.
  const params = {
      "returnFaceId": "true",
      "returnFaceLandmarks": "false",
      "returnFaceAttributes": "emotion"
  };
  
  // Converts params into Uri string
  path += 
    Object
    .entries(params)
    .map(([k, v]) => 
      `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  // Perform the REST API call.
  const postData = imageFile.path;
  const options = {
    hostname: hostName, 
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  };

  let img = fs.readFileSync(postData);
  return axios({method: "POST", url: hostName, headers: options['headers'], params: params, data: img})
  .then(function(response) {
    return response.data[0].faceAttributes
  })
  .catch(function(error) {
    console.log(error)
  })
};
