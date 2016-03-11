const autoprefixer = require('autoprefixer');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const knex = require('knex');

const app = express();

// Setup database

const pg = knex(require('./knexfile')[app.get('env')]);

// Parse params

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve assets


app.get('/styles.css', (req, res) => {
  const { css } = autoprefixer.process(fs.readFileSync(`${process.cwd()}/styles.css`));

  res.header("Content-type", "text/css");
  res.send(css);
});

app.use('/jspm_packages', express.static('./jspm_packages'));
app.use('/', express.static('./'));

// Api

const now = () => new Date().toISOString();

app.get('/messages', ({ body }, res) => {
  pg('messages').orderBy('created_at').then(rows => res.json(rows));
});

app.post('/messages', ({ body }, res) => {
  pg('messages').insert(Object.assign({}, body, { created_at: now(), updated_at: now() })).then(row => res.json(row));
});

// Start server

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on: http://0.0.0.0:${process.env.PORT || 5000}`);
});
