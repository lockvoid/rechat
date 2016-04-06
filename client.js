import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Theron, ROW_ADDED, ROW_REMOVED } from 'theron';

const DEFAULT_HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json' }

class Api {
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

// Syncronized array

function syncArray(rows, action) {
  console.log(action);

  switch (action.type) {
    case ROW_ADDED:
      return rowAdded(rows.slice(), action.payload);

    case ROW_REMOVED:
      return rowRemoved(rows.slice(), action.payload);

    default:
      return rows;
  }
}

function rowAdded(rows, { row, prevRowId }) {
  const index = nextRowIndex(rows, prevRowId);
  rows.splice(index, 0, row);

  return rows;
}

function rowRemoved(rows, { row }) {
  let index = indexForRow(rows, row.id);

  if (index > -1) {
    rows.splice(index, 1);
  }

  return rows;
}

function indexForRow(rows, rowId) {
  return rows.findIndex(row => row.id === rowId);
}

function nextRowIndex<T>(rows, prevRowId) {
  if (prevRowId === null) {
    return 0;
  }

  let index = indexForRow(rows, prevRowId);

  if (index === -1) {
    return rows.length;
  } else {
    return index + 1;
  }
}

// React application

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

  componentWillMount() {
    const { theron } = this.props;

    this._subscription = theron.watch('/messages').scan(syncArray, []).subscribe(
      messages => {
        this.setState({ messages });
      },

      error => {
        console.log(error);
      }
    );
  }

  componentWillUnmount() {
    this._subscription.unsubscribe();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.messages.length < this.state.messages.length) {
      this._history.scrollTop = this._history.scrollHeight;
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

const theron = new Theron('https://therondb.com', { app: document.querySelector('meta[name="app"]').getAttribute('content') })

ReactDOM.render(<Main api={new Api()} theron={theron}/>, document.getElementById('main'));
