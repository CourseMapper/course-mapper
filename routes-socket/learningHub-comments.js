var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Controller = require('../modules/learningHub/learningHub.controller');

module.exports = function (io) {
    // emit a event when the comments of a post is updated
    var emitCommentsUpdatedAsync = async(function (post) {
        if (!post) {
            return;
        }
        var eventName = post._id + ':comments:updated';
        io.sockets.emit(eventName, {comments: post.comments});
    });
    // establish a connection
    io.sockets.on('connection', function (socket) {
        var getUser = function () {
            var hasSession = socket && socket.request && socket.request.session && socket.request.session.passport;
            if (!hasSession) {
                throw 'No user session found.'
            }
            return socket.request.session.passport.user;
        };
        //post a comment
        socket.on('comments:post', async(function (params) {
            try {
                var post = await(Controller.addCommentAsync(params, getUser()));
                //console.log("waiting to emit.");
                await(emitCommentsUpdatedAsync(post));
            } catch (e) {
                console.log('Error posting comment: ' + e);
            }
        }));
        // remove a comment
        socket.on('comments:remove', async(function (params) {
            try {
                var post = await(Controller.removeCommentAsync(params, getUser()));
                await(emitCommentsUpdatedAsync(post));
            } catch (e) {
                console.log('Error removing comment: ' + e);
            }
        }));

    });
};





