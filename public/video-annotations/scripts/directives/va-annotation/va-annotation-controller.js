/*jslint node: true */
'use strict';

videoAnnotationsModule.controller('VaController', ['$scope', 'socket', '$rootScope',
    function($scope, socket, rootScope) {

        // Get the user from the root scope
        var currentUser = rootScope.user;

        function markAuthoredComments(comments) {
            _.forEach(comments, function(comment) {
                comment.isAuthor = (comment.author === currentUser.username);
            });
        }

        this.init = function() {
            $scope.commentText = '';

            var annotationId = $scope.source._id;
            var eventName = annotationId + ':comments:updated';

            socket.on(eventName, function(params) {
                markAuthoredComments(params.comments);
                $scope.source.comments = params.comments;
            });
        };

        $scope.postComment = function() {
            var annotationId = $scope.source._id;
            var commentText = $scope.commentText;

            if (!commentText || !annotationId) {
                return;
            }

            var params = {
                annotation_id: annotationId,
                text: commentText
            };

            socket.emit('comments:post', params);
            $scope.commentText = '';
        };


        $scope.removeComment = function(commentId) {
            var params = {
                annotation_id: $scope.source._id,
                comment_id: commentId
            };
            socket.emit('comments:remove', params);
        };

        this.init();
    }
]);
