var config = require('config');
var Newsfeed = require('./models/newsfeed.model.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
//var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function newsfeedSystem(){

}

newsfeedSystem.prototype.getNewsfeed = function (error,courseId, success) {
    Newsfeed.find({courseId: courseId})
            .populate('userId', 'username displayName')
            .exec(function(err, docs) {
                if (err){
                    error(err);
                } else {
                    success(docs);
                }
            });
};

module.exports = newsfeedSystem;