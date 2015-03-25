/**
 * connecting to database, and returns a mongoose instance
 */

var mongoose = require('mongoose');
var config = require('config');

function database(){
    this.connectionOptions = config.get('database');
}

database.prototype.connect = function(){
    return mongoose.connect(this.connectionOptions);
};

var DB = new database();
var db = DB.connect();

module.exports = db;

