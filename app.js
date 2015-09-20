/*jslint node: true */
'use strict';

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var http = require('http');
var config = require('config');
var cookieParser = require('cookie-parser')(config.get('session.secret'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser);

// live reload
if (app.get('env') === 'development') {
    app.use(require('connect-livereload')({
        port: 4002
    }));
}

// static css/js/images
app.use(express.static(path.join(__dirname, 'public')));

// Create HTTP and IO servers
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var multiRouterSocket = require('./libs/core/multiRouterSocket.js');
new multiRouterSocket(io, __dirname + '/routes-socket').populateRoutes();

var db = require('./libs/core/database.js');
require('./libs/core/session.js')(app, db, io, cookieParser);

// auto create and use routes
var multiRouter = require('./libs/core/multiRouter.js');
new multiRouter(app, __dirname + '/routes').populateRoutes();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/////
// error handlers
/////

// development error handler
// will print stack trace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('admin-lte/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stack traces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = server;
