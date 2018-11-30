import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

class Player extends Component {
  constructor(props) {
    super(props)

    this.state = {
      userId: 'mrs' + makeId(),
      gameId: 'gameId',
      streaming: false,
      photoTaken: false,
    }

    this.video = React.createRef()
    this.canvas = React.createRef()
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: { facingMode: 'user' },
      })
      .then(stream => {
        video.srcObject = stream
        this.setState({ streaming: true })
      })
      .catch(console.error)
  }

  render() {
    return (
      <div>
        <div className="container">
          <div style={{ display: 'flex' }}>
            <video ref={this.video} id="video" autoPlay playsInline>
              Video stream not available.
            </video>
            <div>
              Game Id:
              <input
                id="gameIdBox"
                value={this.state.gameId}
                onChange={e => this.setState({ gameId: e.target.value })}
              />
              <br />
              Player Id:
              <input
                value={this.state.userId}
                onChange={e => this.setState({ userId: e.target.value })}
              />
              <br />
              {this.state.streaming && (
                <button id="button" onClick={this.takePhoto}>
                  Take photo
                </button>
              )}
              <br />
              {this.state.photoTaken && (
                <button id="submit" onClick={this.submitPhoto}>
                  Submit photo
                </button>
              )}
            </div>
          </div>
          <div>
            <canvas ref={this.canvas} id="canvas" />
          </div>
        </div>
      </div>
    )
  }

  takePhoto = () => {
    const width = video.videoWidth
    const height = video.videoHeight

    const context = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    context.drawImage(video, 0, 0, width, height)

    this.setState({ photoTaken: true })
  }

  submitPhoto = () => {
    // const imageData = canvas.toDataURL('image/png')
    canvas.toBlob(blob => {
      const data = new FormData()
      data.append('image', blob)
      axios.post('/imitato/game/round/submit', data, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        },
        params: {
          gameId: this.state.gameId,
          userId: this.state.userId,
          round: 0,
        },
      })
    }, 'image/jpeg')
  }

  clearPhoto = () => {
    const canvas = this.canvas.current

    const context = canvas.getContext('2d')
    context.fillStyle = '#AAA'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
}

ReactDOM.render(<Player />, document.getElementById('root'))

function makeId() {
  const POSSIBLE_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let id = ''

  for (var i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * POSSIBLE_CHARS.length)
    id += POSSIBLE_CHARS.charAt(randomIndex)
  }

  return id
}
