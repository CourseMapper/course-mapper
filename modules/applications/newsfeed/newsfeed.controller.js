var config = require('config');
var Newsfeed = require('./models/newsfeed.model.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var moment = require('moment');
//var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function newsfeedSystem(){

}

newsfeedSystem.prototype.getNewsfeed = function (error,courseId, success) {
    var today = moment();
    var lastThirtyDays = moment(today).subtract(30, 'days');
    Newsfeed.find(
        {
            courseId: courseId,
            dateAdded: {
                $lte: today,
                $gte: lastThirtyDays
            },
            actionSubject: {$in: [/node/i, "sub topic", "course", "discussion"]} // SLASHnodeSLASHi is regex to find all doc contain word "node"
        })
            .populate('userId', '_id image displayName')
            .exec(function(err, docs) {
                if (err){
                    error(err);
                } else {
                    success(docs);

                }
            });
};

newsfeedSystem.prototype.getNewsfeedNode = function (error,courseId, nodeId, success) {
    var today = moment();
    var lastThirtyDays = moment(today).subtract(30, 'days');
    Newsfeed.find(
        {
            courseId: courseId,
            dateAdded: {
                $lte: today,
                $gte: lastThirtyDays
            },
            actionSubject: {$in: ["content node", "pdf annotation", "video annotation", "link"]},
            nodeId: nodeId
        })
        .populate('userId', '_id image displayName')
        .exec(function(err, docs) {
            if (err){
                error(err);
            } else {
                success(docs);

            }
        });
};

module.exports = newsfeedSystem;