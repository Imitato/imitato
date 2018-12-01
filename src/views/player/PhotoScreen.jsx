import React from 'react'
import styled from 'styled-components'
import axios from 'axios'
import LoadingView from './LoadingView'

const USER_MEDIA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
  },
}

export default class PhotoScreen extends React.Component {
  state = { streaming: false, photoTaken: false }

  constructor(props) {
    super(props)
    this.video = React.createRef()
    this.canvas = React.createRef()
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia(USER_MEDIA_CONSTRAINTS)
      .then(stream => {
        this.video.current.srcObject = stream
        this.setState({ streaming: true })
      })
      .catch(console.error)
  }

  render() {
    return (
      <Styles>
        {!this.state.streaming && <LoadingView />}
        <div style={{ display: this.state.photoTaken ? 'none' : 'block' }}>
          <video ref={this.video} className="photo" autoPlay playsInline>
            Video stream not available.
          </video>
          <button id="photo-button" onClick={this.takePhoto} />
        </div>
        <div style={{ display: this.state.photoTaken ? 'block' : 'none' }}>
          <canvas ref={this.canvas} className="photo" />
          <button
            id="retake-button"
            onClick={() => this.setState({ photoTaken: false })}
          >
            ×
          </button>
        </div>
      </Styles>
    )
  }

  takePhoto = () => {
    const video = this.video.current
    const canvas = this.canvas.current

    const width = video.videoWidth
    const height = video.videoHeight

    const context = canvas.getContext('2d')
    canvas.width = width
    canvas.height = height
    context.drawImage(video, 0, 0, width, height)

    this.setState({ photoTaken: true })
  }

  submitPhoto = () => {
    const canvas = this.canvas.current
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
        },
      })
    }, 'image/jpeg')
  }
}

const Styles = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  border: none;

  .photo {
    object-fit: cover;
    width: calc(100vw + 1px);
    height: 100vh;
    border: none;
    transform: scale(-1, 1);
  }

  #photo-button {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 40px;
    margin: 0 auto;
    width: 60px;
    height: 60px;

    border: none;
    border-radius: 50%;

    background: url('https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg')
      no-repeat center;
    background-size: contain;
    cursor: pointer;
  }

  #retake-button {
    position: absolute;
    left: 0.2em;
    top: 0.2em;
    margin: 0;
    padding: 0;
    border: none;
    background: none;

    color: white;
    font-size: 50px;
    text-shadow: 0px 0px 1px black;
    line-height: 0.6;
    cursor: pointer;
  }
`
