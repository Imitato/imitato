const express = require('express')
const multer = require('multer')

const upload = multer({ dest: 'uploads/', preservePath: true })

const app = express()
const port = 3000

// upload images
app.post('/game_round', upload.single('image'), (req, res) => {
  res.send(req.file)
})

app.listen(port, () => {
  console.log(`Listening on port ${port}.`)
})
