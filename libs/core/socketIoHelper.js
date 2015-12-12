/*jslint node: true */
'use strict';

var Socket = require('socket.io');

var socketIoHelper = {
    io: null,

    init: function (server) {
        var self = this;

        self.io = Socket.listen(server);
    },

    checkSession: function (socket) {
        var hasSession = socket &&
            socket.request &&
            socket.request.session &&
            socket.request.session.passport &&
            socket.request.session.passport.user;
        return hasSession;
    },

    parseRoom: function (room) {
        try {
            var spl = room.split('/');
            var prefix = spl[0];
            var params = [];
            if (spl.length > 2) {
                params = spl[2].split('|');
            }
            return {
                prefix: prefix,
                room: prefix + '/' + spl[1],
                channel: spl[1],
                params: params
            };
        } catch (e) {
            return false;
        }
    }

};

module.exports = socketIoHelper;