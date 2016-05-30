/* jslint node:true */

/**
 * connecting to database, and returns a mongoose instance
 */

var mongoose = require('mongoose');
var config = require('config');

function database() {
    this.connectionOptions = config.get('database');
}

database.prototype.connect = function() {
    return mongoose.connect(this.connectionOptions);
};

var DB = new database();
var db = DB.connect();

mongoose.connection.on('error', function dbConnectionFailed(err) {
    console.log('Database error: %s', err);
}).once('open', function dbConnectionOpened() {
    console.log('Database connected to "%s".', config.get('database'));
});

module.exports = db;
