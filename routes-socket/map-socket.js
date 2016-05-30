var async = require('asyncawait/async'),
    await = require('asyncawait/await');

var Plugin = require('../modules/apps-gallery/backgroundPlugins.js');
var SocketIoHelper = require('../libs/core/socketIoHelper.js');
var Course = require('../modules/catalogs/course.controller.js');

module.exports = function (io) {

    io.sockets.on('connection', function (socket) {

        socket.on('subscribe',
            async(function (data) {
                if (!SocketIoHelper.checkSession(socket)) {
                    return '401';
                }

                var parsed = SocketIoHelper.parseRoom(data.room);
                if (parsed.prefix == 'map') {
                    socket.join(parsed.room);
                    var cid = parsed.channel;
                    var crs = new Course();
                    var course = await(crs.getCourseAsync({_id: cid})());
                    if (course) {
                        socket.emit('joined', {result: true, courseId: course._id});
                    } else {
                        socket.emit('joinFailed', {result: false, message: 'cannot find course'});
                    }
                }
            })
        );
    });
};
