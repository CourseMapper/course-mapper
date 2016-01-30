/*jslint node: true */
'use strict';

var async = require('asyncawait/async');
var await = require('asyncawait/await');
var VideoAnnotation = require('../modules/annotations/models/video-annotation');
var VAController = require('../modules/annotations/controllers/video-annotations-controller');

var Plugin = require('../modules/apps-gallery/backgroundPlugins.js');

var checkSession = function (socket) {
  var hasSession = socket &&
    socket.request &&
    socket.request.session &&
    socket.request.session.passport &&
    socket.request.session.passport.user;
  return hasSession;
};

module.exports = function (io) {
  io.sockets.on('connection', function (socket) {

    socket.on('annotations:get', async(function (params) {
      var videoId = params.video_id;
      var annotations = await(VAController.findByVideoIdAsync(videoId));
      // return annotations only to requester
      socket.emit('annotations:updated', annotations);
    }));

    socket.on('annotations:save', async(function (params) {
      if (!checkSession(socket)) {
        return;
      }

      // find annotation model from DB
      var id = params.annotation._id;
      var annotation = await(VAController.findByIdAsync(id));

      var user = socket.request.session.passport.user;

      // update annotation properties
      if (annotation) {
        // Do not allow other users, except
        // the author an admin to modify the annotation
        var isAuthor = annotation.author === user.username;
        var isAdmin = user.role === 'admin';
        if (!isAuthor && !isAdmin) {
          return;
        }
        var model = params.annotation;

        annotation.start = model.start;
        annotation.end = model.end;
        annotation.text = model.text;
        annotation.position = model.position;
        annotation.size = model.size;
        annotation.type = model.type;

        // save to DB
        await(VAController.update(annotation));

        Plugin.doAction('onAfterVideoAnnotationEdited', annotation);
      } else {
        //  set the author and
        // create new model in DB
        params.annotation.author = user.username;
        params.annotation.authorId = user._id;
        params.annotation.authorDisplayName = user.displayName;
        annotation = await(VAController.add(params.annotation));

        Plugin.doAction('onAfterVideoAnnotationCreated', annotation);
      }
      var videoId = annotation.video_id;
      var annotations = await(VAController.findByVideoIdAsync(videoId));

      // notify all users about changes
      io.sockets.emit('annotations:updated', annotations);
    }));

    socket.on('annotations:delete', async(function (params) {
      try {
        var annotationId = params.id;

        // find annotation in db
        var annotation = await(VAController.findByIdAsync(annotationId));
        if (!annotation) {
          return;
        }

        var videoId = annotation.video_id;

        // remove annotation from db
        await(annotation.remove());
        Plugin.doAction('onAfterVideoAnnotationDeleted', videoId);

        var annotations = await(VAController.findByVideoIdAsync(videoId));

        // notify all users about changes
        io.sockets.emit('annotations:updated', annotations);
      } catch (e) {
        console.log(e);
      }
    }));

    socket.on('comments:post', async(function (params) {
      try {
        var annotationId = params.annotation_id;

        // find annotation in db
        var annotation = await(VAController.findByIdAsync(annotationId));
        if (!annotation) {
          return;
        }
        if (!checkSession(socket)) {
          return;
        }
        var user = socket.request.session.passport.user;
        var comment = {
          text: params.text,
          author: user.username || 'Unknown',
          authorDisplayName: user.displayName || user.username || 'Unknown'
        };

        annotation.comments.push(comment);

        // Save annotation
        await(annotation.save());

        // Notify users that the annotation
        // comments have been updated
        var eventName = annotationId + ':comments:updated';
        io.sockets.emit(eventName, {
          comments: annotation.comments
        });
      } catch (e) {
        console.log(e);
      }
    }));

    socket.on('comments:remove', async(function (params) {
      try {
        var annotationId = params.annotation_id;
        var commentId = params.comment_id;

        var annotation = await(VAController.findByIdAsync(annotationId));
        if (!annotation) {
          return;
        }
        if (!checkSession(socket)) {
          return;
        }
        var user = socket.request.session.passport.user;
        var isAdmin = user.role === 'admin';

        for (var i = 0; i < annotation.comments.length; i++) {
          if (annotation.comments[i]._id.toString() === commentId) {
            var isAuthor = annotation.comments[i].author === user.username;
            if (isAuthor || isAdmin) {
              //console.log('removing comment', commentId);
              annotation.comments[i].remove();
              break;
            }
          }
        }

        // Save annotation
        await(annotation.save());

        var eventName = annotationId + ':comments:updated';
        io.sockets.emit(eventName, {
          comments: annotation.comments
        });

      } catch (e) {
        console.log(e);
      }
    }));
  });
};
