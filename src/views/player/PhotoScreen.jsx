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

        // wait a bit for video to load
        setTimeout(() => this.setState({ streaming: true }), 100)
      })
      .catch(console.error)
  }

  render() {
    return (
      <Styles>
        {!this.state.streaming && <LoadingView />}
        <div className={this.state.photoTaken ? 'hidden' : undefined}>
          <video ref={this.video} className="photo" autoPlay playsInline>
            Video stream not available.
          </video>
          <button id="photo-button" onClick={this.takePhoto} />
        </div>
        <div className={this.state.photoTaken ? undefined : 'hidden'}>
          <canvas ref={this.canvas} className="photo" />
          <button id="retake-button" onClick={this.retakePhoto} />
          <button id="submit-button" onClick={this.submitPhoto} />
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

  retakePhoto = () => {
    this.setState({ photoTaken: false })
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

  .hidden {
    display: none;
  }

  #photo-button {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 40px;
    margin: 0 auto;
    padding: 0;
    width: 60px;
    height: 60px;
    border: none;

    background: url('https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg')
      no-repeat center;
    background-size: contain;
    filter: drop-shadow(0 0 1px black);
    cursor: pointer;
  }

  #retake-button {
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 0;
    width: 24px;
    height: 24px;
    border: none;

    background: url(images/close-button.svg) no-repeat center;
    background-size: contain;
    filter: drop-shadow(0 0 0.8px black);
    cursor: pointer;
  }

  #submit-button {
    position: absolute;
    right: 20px;
    bottom: 20px;
    padding: 0;
    width: 48px;
    height: 48px;
    border: none;

    background: url(images/play-button.svg) no-repeat center;
    background-size: contain;
    filter: drop-shadow(0 0 1px black);
    cursor: pointer;
  }
`
