const bodyParser = require('body-parser');
const express = require('express');
const knex = require('knex');

const app = express();

// Setup database

const pg = knex(require('./knexfile')[app.get('env')]);

// Parse params

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve assets

app.use('/jspm_packages', express.static('./jspm_packages'));

app.use('/', express.static('./'));

// Start server

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening on: http://0.0.0.0:${process.env.PORT || 5000}`);
});
