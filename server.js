const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();
const api = require('./Server/Routes/api');

// Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// Set our api routes
app.use('/api', api);

// Set port
const port = process.env.PORT || '8080';
app.set('port', port);

// Create the HTTP server
const server = http.createServer(app);
server.listen(port, () => console.log('Running on localhost:8080'));
