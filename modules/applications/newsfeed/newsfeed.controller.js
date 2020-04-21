var config = require('config');
var Newsfeed = require('./models/newsfeed.model.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var moment = require('moment');
var _ = require('lodash');

//var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function newsfeedSystem() {
}

var loadNewsFeedDataAsync = function (query) {
  return Newsfeed.find(query)
    .populate('userId', '_id image displayName')
    .populate('nodeId')
    .execAsync()
    .then(function (docs) {
      var publicNodes = _.filter(docs, function (item) {
        return item.nodeId ? !item.nodeId.isPrivate : true;
      });
      return publicNodes;
    });
};

newsfeedSystem.prototype.getNewsfeed = function (error, courseId, success) {
  var today = moment();
  var lastThirtyDays = moment(today).startOf('day').subtract(30, 'days');
  var query = {
    courseId: courseId,
    dateAdded: {$lte: today, $gte: lastThirtyDays}
    //actionSubject: {$in: [/node/i, "sub topic", "course", "discussion"]} // SLASHnodeSLASHi is regex to find all doc contain word "node"
  };
  loadNewsFeedDataAsync(query).then(success).catch(error);
};

newsfeedSystem.prototype.getNewsfeedLastWeek = function (error, courseId, success) {
  var today = moment();
  var lastWeek = moment(today).startOf('day').subtract(7, 'days');
  var query = {
    courseId: courseId,
    dateAdded: {$lte: today, $gte: lastWeek}
    //actionSubject: {$in: [/node/i, "sub topic", "course", "discussion"]} // SLASHnodeSLASHi is regex to find all doc contain word "node"
  };
  loadNewsFeedDataAsync(query).then(success).catch(error);
};

newsfeedSystem.prototype.getNewsfeedToday = function (error, courseId, success) {
  var today = moment();
  var beginDay = moment(today).startOf('day');
  var query = {
    courseId: courseId,
    dateAdded: {
      $lte: today,
      $gte: beginDay
    }
    //actionSubject: {$in: [/node/i, "sub topic", "course", "discussion"]} // SLASHnodeSLASHi is regex to find all doc contain word "node"
  };
  loadNewsFeedDataAsync(query).then(success).catch(error);
};

//get newsfeed data for content node newsfeed
newsfeedSystem.prototype.getNewsfeedNode = function (error, courseId, nodeId, success) {
  var today = moment();
  var lastThirtyDays = moment(today).startOf('day').subtract(30, 'days');
  var query = {
    courseId: courseId,
    dateAdded: {
      $lte: today,
      $gte: lastThirtyDays
    },
    //actionSubject: {$in: ["content node", "pdf annotation", "pdf annotation in", "video annotation", "link"]},
    actionSubject: {$in: ["content node", "pdf annotation", "video annotation", "external resource", "vote"]},
    nodeId: nodeId
  };
  loadNewsFeedDataAsync(query).then(success).catch(error);
};

newsfeedSystem.prototype.getNewsfeedNodeLastWeek = function (error, courseId, nodeId, success) {
  var today = moment();
  var lastWeek = moment(today).startOf('day').subtract(7, 'days');
  var query = {
    courseId: courseId,
    dateAdded: {
      $lte: today,
      $gte: lastWeek
    },
    //actionSubject: {$in: ["content node", "pdf annotation", "video annotation", "link"]},
    actionSubject: {$in: ["content node", "pdf annotation", "video annotation", "external resource"]},
    nodeId: nodeId
  };
  loadNewsFeedDataAsync(query).then(success).catch(error);
};

newsfeedSystem.prototype.getNewsfeedNodeToday = function (error, courseId, nodeId, success) {
  var today = moment();
  var beginDay = moment(today).startOf('day');
  var query = {
    courseId: courseId,
    dateAdded: {
      $lte: today,
      $gte: beginDay
    },
    //actionSubject: {$in: ["content node", "pdf annotation", "video annotation", "link"]},
    actionSubject: {$in: ["content node", "pdf annotation", "video annotation", "external resource"]},
    nodeId: nodeId
  };
  loadNewsFeedDataAsync(query).then(success).catch(error);
};

module.exports = newsfeedSystem;