'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var VAController = require('../modules/annotations/video-annotations-controller');
var Plugin = require('../modules/apps-gallery/backgroundPlugins.js');

module.exports = function (io) {

  // notifies all users about changes
  var emitAnnotationUpdatedAsync = async(function (videoId) {
    if (!videoId) {
      throw 'Invalid video ID: ' + videoId;
    }
    var annotations = await(VAController.findByVideoIdAsync(videoId));
    io.sockets.emit('annotations:updated', annotations);
  });

  // Notify users that the annotation
  // comments have been updated
  var emitCommentsUpdatedAsync = async(function (annotation) {
    if (!annotation) {
      return;
    }
    var eventName = annotation._id + ':comments:updated';
    io.sockets.emit(eventName, {comments: annotation.comments});
  });

  io.sockets.on('connection', function (socket) {

    var getUser = function () {
      var hasSession = socket && socket.request && socket.request.session && socket.request.session.passport;
      if (!hasSession) {
        throw 'No user session found.'
      }
      return socket.request.session.passport.user;
    };

    socket.on('annotations:get', async(function (params) {
      var annotations = await(VAController.findByVideoIdAsync(params.video_id));
      // return annotations only to requester
      socket.emit('annotations:updated', annotations);
    }));

    socket.on('annotations:save', async(function (params) {
      try {
        var user = getUser();
        var model = params.annotation;
        var annotation = await(VAController.updateAsync(model, user));
        if (annotation) {
          Plugin.doAction('onAfterVideoAnnotationEdited', annotation, user);
        } else {
          annotation = await(VAController.addAsync(model, user));
          Plugin.doAction('onAfterVideoAnnotationCreated', annotation);
        }
        var videoId = annotation.video_id;
        await(emitAnnotationUpdatedAsync(videoId));
      }
      catch (e) {
        console.log('Error saving video annotation: ' + e);
      }
    }));

    socket.on('annotations:delete', async(function (params) {
      try {
        var annotation = await(VAController.removeAsync(params.id, getUser()));
        if (!annotation) {
          return;
        }
        var videoId = annotation.video_id;
        Plugin.doAction('onAfterVideoAnnotationDeleted', annotation, getUser());
        await(emitAnnotationUpdatedAsync(videoId));
      } catch (e) {
        console.log('Error removing video annotation: ' + e);
      }
    }));

    socket.on('comments:post', async(function (params) {
      try {
        var annotation = await(VAController.addCommentAsync(params, getUser()));
        Plugin.doAction('onAfterVideoCommentCreated', annotation, getUser());
        await(emitCommentsUpdatedAsync(annotation));
      } catch (e) {
        console.log('Error posting comment: ' + e);
      }
    }));

    socket.on('comments:remove', async(function (params) {
      try {
        var annotation = await(VAController.removeCommentAsync(params, getUser()));
        Plugin.doAction('onAfterVideoCommentDeleted', annotation, getUser());
        await(emitCommentsUpdatedAsync(annotation));
      } catch (e) {
        console.log('Error removing comment: ' + e);
      }
    }));
  });
};