var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Controller = require('../modules/learningHub/learningHub.controller');


module.exports = function (io) {
    var emitCommentsUpdatedAsync = async(function (post) {
        console.log(post);
        console.log('emitted');
        if (!post) {
            return;
        }
        var eventName = post._id + ':comments:updated';
        io.sockets.emit(eventName, {comments: post.comments});
    });


    io.sockets.on('connection', function (socket) {

        var getUser = function () {
            var hasSession = socket && socket.request && socket.request.session && socket.request.session.passport;
            if (!hasSession) {
                throw 'No user session found.'
            }
            return socket.request.session.passport.user;
        };

        socket.on('comments:post', async(function (params) {
            console.log('listened');
            console.log(params);
            try {
                var post = await(Controller.addCommentAsync(params, getUser()));
                console.log("waiting to emit");
                await(emitCommentsUpdatedAsync(post));
            } catch (e) {
                console.log('Error posting comment: ' + e);
            }
        }));

        socket.on('comments:remove', async(function (params) {
            try {
                var post = await(Controller.removeCommentAsync(params, getUser()));
                await(emitCommentsUpdatedAsync(post));
            } catch (e) {
                console.log('Error removing comment: ' + e);
            }
        }));

    });


}





