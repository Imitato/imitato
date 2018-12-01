import React from 'react'
import styled from 'styled-components'
import LoadingView from './LoadingView'

const USER_MEDIA_CONSTRAINTS = {
  video: {
    facingMode: 'user',
  },
}

export default class PhotoScreen extends React.Component {
  state = { streaming: false }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia(USER_MEDIA_CONSTRAINTS)
      .then(stream => {
        video.srcObject = stream
        this.setState({ streaming: true })
      })
      .catch(console.error)
  }

  render() {
    return (
      <Styles>
        {!this.state.streaming && <LoadingView />}
        <video ref={this.video} id="video" autoPlay playsInline>
          Video stream not available.
        </video>
        <button className="photo-button" />
      </Styles>
    )
  }
}

const Styles = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  border: none;

  video {
    object-fit: cover;
    width: calc(100% + 1px);
    height: 100%;
    border: none;
    transform: scale(-1, 1);
  }

  .photo-button {
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
  }
`
