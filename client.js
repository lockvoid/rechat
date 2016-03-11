import * as React from 'react';
import * as ReactDOM from 'react-dom';

const DEFAULT_HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json' }

class Api {
  fetchMessages() {
    return fetch('/messages').then(Api.checkStatus).then(Api.parse);
  }

  createMessage(payload) {
    return fetch('/messages', { method: 'POST', headers: DEFAULT_HEADERS, body: Api.stringify(payload) }).then(Api.checkStatus).then(Api.parse);
  }

  static async checkStatus(res) {
    if (res.status >= 200 && res.status < 300) {
      return res;
    }

    throw new Error(res.statusText);
  }

  static parse(res) {
    return res.json();
  }

  static stringify(body) {
    return JSON.stringify(body);
  }
}

class Message extends React.Component {
  render() {
    const { message: { user, message, created_at } } = this.props;

    return (
      <li>
        <div className="meta">
          <span className="user">{user}</span>
          <span className="time">{created_at}</span>
        </div>

        <div className="message">{message}</div>
      </li>
    );
  }
}

class MessageForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: '', message: '' };
  }

  onUserChange(event) {
    this.setState({ user: event.target.value });
  }

  async sendMessage(event) {
    this.setState({ message: this._input.value });

    if (event.which === 13) {
      const { api } = this.props;

      try {
        await api.createMessage(this.state);
        this._input.value = '';
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  render() {
    return (
      <footer className="form">
        <input type="text" className="user" placeholder="Your name" onChange={this.onUserChange.bind(this)} />
        <input type="text" className="message" placeholder="Type your message here..." ref={ref => this._input = ref} onKeyUp={this.sendMessage.bind(this)} />
      </footer>
    );
  }
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
  }

  componentDidMount() {
    this.fetchMessages();
    setInterval(this.fetchMessages.bind(this), 2000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.messages.length < this.state.messages.length) {
      this._history.scrollTop = this._history.scrollHeight;
    }
  }

  async fetchMessages() {
    const { api } = this.props;

    try {
      const messages = await api.fetchMessages();
      this.setState({ messages });
    } catch(error) {
      console.log(error);
    }
  }

  render() {
    const { messages } = this.state;
    const { api } = this.props;

    return (
      <main>
        <section className="history" ref={ref => this._history = ref}>
          <ul>
            {messages.map(message => <Message message={message} key={message.id} />)}
          </ul>
        </section>

        <MessageForm api={api} />
      </main>
    );
  }
}

ReactDOM.render(<Main api={new Api()} />, document.getElementById('main'));
