'use strict';

const e = React.createElement;

let request = function(gateway_url, type = 'GET', element) {
  fetch(gateway_url, {
    method: type,
    mode: 'no-cors'
    /* TODO: Do we need 'cors'?
    Allows cross-origin requests, for example to access various APIs offered by 
    3rd party vendors. These are expected to adhere to the CORS protocol. Only a 
    limited set of headers are exposed in the Response, but the body is readable.*/
  })
  .then((response) => {
    console.log(JSON.stringify(response));
    let data = response.json();
    console.log('Response received for ${type} request to ${gateway_url}');
    element.changed = true;
    element.body = JSON.stringify(data);
    element.pressed = true;
  })
}

class SubmitButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  onClickHandler() {
    request('/imitato/game/create', 'GET', this)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.changed) {
      this.changed = false;
  
      this.setState({
        body: this.body
      });
    }
  }
  
  componentWillUnmount() {
    this.changed = false;
  }

  render() {
    if (this.state.pressed) {
      return this.state.body;
    }

    return e(
      'button',
      { onClick: this.onClickHandler.bind(this) },
      'Submit'
    );
  }
}

const domContainer = document.querySelector('#submit_button_container');
ReactDOM.render(e(SubmitButton), domContainer);