'use strict';

/**
 * Application routes
 */
module.exports = function(app, io) {
    var api = require('./controllers/api')(io),
    index = require('./controllers');
    // Server API Routes
    app.get('/api/op', api.op);
    app.get('/api/wit', api.wit);
    app.use('/api/state', api.state);
    app.use('/api/test', api.test);


    // All undefined api routes should return a 404
    app.get('/api/*', function(req, res) {
        res.send(404);
    });

    // All other routes to use Angular routing in app/scripts/app.js
    app.get('/*', index.index);
};