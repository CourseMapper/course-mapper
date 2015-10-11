/*jslint node: true */
'use strict';

var async = require('asyncawait/async'),
    await = require('asyncawait/await'),
    VideoAnnotation = require('../modules/annotations/models/video-annotation');

var checkSession = function(socket) {
    return socket &&
        socket.request &&
        socket.request.session &&
        socket.request.session.passport &&
        socket.request.session.passport.user;
};

module.exports = function(io) {

    io.sockets.on('connection', function(socket) {
        var getAnnotationsAsync = async(function(videoId) {
            return await (VideoAnnotation.find({
                video_id: videoId
            }).sort('start').exec());
        });

        socket.on('annotations:get', async(function(params) {
            var videoId = params.video_id;
            var annotations = await (getAnnotationsAsync(videoId));

            // return annotations only to requester
            socket.emit('annotations:updated', annotations);
        }));

        socket.on('annotations:save', async(function(params) {
            // find annotation model from DB
            var annotation = await (VideoAnnotation.findById(params.annotation._id).exec());
            if (!checkSession()) {
                return;
            }
            var user = socket.request.session.passport.user;

            // update annotation properties
            if (annotation) {
                // Do not allow other users, except the author to
                // modify the annotation
                if (annotation.author !== user.username) {
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
                await (annotation.save());
            } else {
                //  set the author and
                // create new model in DB 
                params.annotation.author = user.username;
                annotation = await (VideoAnnotation.create(params.annotation));
            }
            var videoId = annotation.video_id;
            var annotations = await (getAnnotationsAsync(videoId));
            // notify all users about changes
            io.sockets.emit('annotations:updated', annotations);
        }));

        socket.on('annotations:delete', async(function(params) {
            try {
                var annotationId = params.id;

                // find annotation in db
                var annotation = await (VideoAnnotation.findById(annotationId).exec());
                if (!annotation) {
                    return;
                }

                var videoId = annotation.video_id;

                // remove annotation from db
                await (annotation.remove());
                var annotations = await (getAnnotationsAsync(videoId));

                // notify all users about changes
                io.sockets.emit('annotations:updated', annotations);
            } catch (e) {
                console.log(e);
            }
        }));

        socket.on('comments:post', async(function(params) {
            try {
                var annotationId = params.annotation_id;

                // find annotation in db
                var annotation = await (VideoAnnotation.findById(annotationId).exec());
                if (!annotation) {
                    return;
                }
                if (!checkSession()) {
                    return;
                }
                var user = socket.request.session.passport.user;
                var comment = {
                    text: params.text,
                    author: user.username || 'Unknown'
                };

                annotation.comments.push(comment);

                // Save annotation
                await (annotation.save());

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

        socket.on('comments:remove', async(function(params) {
            try {
                var annotationId = params.annotation_id;
                var commentId = params.comment_id;

                var annotation = await (VideoAnnotation.findById(annotationId).exec());
                if (!annotation) {
                    return;
                }
                if (!checkSession()) {
                    return;
                }
                var user = socket.request.session.passport.user;

                for (var i = 0; i < annotation.comments.length; i++) {
                    if (annotation.comments[i]._id.toString() === commentId) {
                        if (annotation.comments[i].author === user.username) {
                            console.log('removing comment', commentId);
                            annotation.comments[i].remove();
                            break;
                        }
                    }
                }

                // Save annotation
                await (annotation.save());

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
