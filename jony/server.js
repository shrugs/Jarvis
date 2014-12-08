'use strict';

var express = require('express');
var https = require('https');
var fs = require('fs');




var sslkey = fs.readFileSync('ssl-key.pem');
var sslcert = fs.readFileSync('ssl-cert.pem');

var options = {
    key: sslkey,
    cert: sslcert
};


/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ACCESS_TOKEN = '4URZAF4JGTTNKFFB7QSB73ZTGZMGCUFB';

// Application Config
var config = require('./lib/config/config');

var app = express();

var server = https.createServer(options, app);
var io = require('socket.io').listen(server);

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app, io);

// Start server
server.listen(config.port, function () {
    console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

// http listen on 9001
app.listen(9001, function() {
    console.log('Express server listening on port %d in %s mode', 9001, app.get('env'));
});

// Expose app
exports = module.exports = app;