/*jslint node: true */
'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var VAController = require('../modules/annotations/controllers/video-annotations-controller');
var Plugin = require('../modules/apps-gallery/backgroundPlugins.js');

module.exports = function (io) {

  // notifies all users about changes
  var notifyAllSubscribersAsync = async(function (videoId) {
    var annotations = await(VAController.findByVideoIdAsync(videoId));
    io.sockets.emit('annotations:updated', annotations);
  });

  io.sockets.on('connection', function (socket) {


    var getUser = function () {
      var hasSession = socket &&
        socket.request &&
        socket.request.session &&
        socket.request.session.passport;
      if (!hasSession) {
        throw 'No user session found.'
      }
      return socket.request.session.passport.user;
    };


    socket.on('annotations:get', async(function (params) {
      var videoId = params.video_id;
      var annotations = await(VAController.findByVideoIdAsync(videoId));
      // return annotations only to requester
      socket.emit('annotations:updated', annotations);
    }));

    socket.on('annotations:save', async(function (params) {
      try {
        var user = getUser();
        var model = params.annotation;
        var annotation = await(VAController.updateAsync(model, user));
        if (annotation) {
          Plugin.doAction('onAfterVideoAnnotationEdited', annotation);
        } else {
          annotation = await(VAController.addAsync(model, user));
          Plugin.doAction('onAfterVideoAnnotationCreated', annotation);
        }
        var videoId = annotation.video_id;
        await(notifyAllSubscribersAsync(videoId));
      }
      catch (e) {
        console.log('Error saving video annotation: ' + e);
      }
    }));

    socket.on('annotations:delete', async(function (params) {
      try {
        var annotation = await(VAController.removeAsync(params.id));
        if (!annotation) {
          return;
        }
        var videoId = annotation.video_id;
        Plugin.doAction('onAfterVideoAnnotationDeleted', videoId);
        await(notifyAllSubscribersAsync(videoId));
      } catch (e) {
        console.log('Error removing video annotation: ' + e);
      }
    }));

    socket.on('comments:post', async(function (params) {
      try {
        var user = getUser();
        var annotationId = params.annotation_id;
        await(VAController.addCommentAsync(params, user));
        // Notify users that the annotation
        // comments have been updated
        var eventName = annotationId + ':comments:updated';
        var annotation = await(VAController.findByIdAsync(annotationId));
        io.sockets.emit(eventName, {comments: annotation.comments});
      } catch (e) {
        console.log('Error posting comment: ' + e);
      }
    }));

    socket.on('comments:remove', async(function (params) {
      try {
        var user = getUser();
        await(VAController.removeCommentAsync(params, user));

        var annotationId = params.annotation_id;
        var annotation = await(VAController.findByIdAsync(annotationId));
        var eventName = annotationId + ':comments:updated';
        io.sockets.emit(eventName, {comments: annotation.comments});
      } catch (e) {
        console.log('Error removing comment: ' + e);
      }
    }));
  });
};
