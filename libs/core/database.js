/* jslint node:true */
var mongoose = require('mongoose');
var config = require('config');

function database() {
  this.url = process.env.DATABASE || 'mongodb://localhost:27017/course_mapper';
  this.options = { server: {
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
  }};
}

database.prototype.connect = function () {
  return mongoose.connect(this.url, this.options);
};

var DB = new database();
var db = DB.connect();

mongoose.connection.on('error', function dbConnectionFailed(err) {
  console.log('Database error: %s', err);
}).once('open', function dbConnectionOpened() {
  console.log('Database connected to "%s".', process.env.DATABASE);
});

module.exports = db;
