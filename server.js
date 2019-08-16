const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();
const api = require('./Server/Routes/api');
const Utils = require('./Server/Modules/utils');
const Log = Utils.Log
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
server.listen(port, () => Log('INFO', 'Running on localhost:8080'));
