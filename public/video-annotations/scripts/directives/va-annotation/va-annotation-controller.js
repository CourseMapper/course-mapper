/*jslint node: true */
'use strict';

videoAnnotationsModule.controller('VaController', ['$scope', 'socket', '$rootScope',
    function($scope, socket, rootScope) {
        function markAuthoredComments(comments) {
            _.forEach(comments, function(comment) {
                comment.isAuthor = (comment.author === rootScope.user.username);
            });
        }

        this.init = function() {
            $scope.commentText = '';
            $scope.isAuthor = ($scope.source.author === rootScope.user.username);
            $scope.annotationTypes = [{
                id: 'embedded-note',
                name: 'Embedded Note'
            }, {
                id: 'note',
                name: 'Note'
            }];
            // Listen for changes in comments
            socket.on($scope.source._id + ':comments:updated', function(params) {
                markAuthoredComments(params.comments);
                $scope.source.comments = params.comments;
            });
        };

        $scope.editAnnotation = function() {
            $scope.source.isEditMode = true;
        };

        $scope.closeAnnotation = function() {
            $scope.source.isEditMode = false;
        };

        $scope.saveAnnotation = function() {
            var annotation = $scope.source;

            if (!annotation.text) return;
            if (annotation.start < 0) return;
            if (annotation.end < annotation.start) return;

            socket.emit('annotations:save', {
                annotation: annotation
            });
            $scope.source.isEditMode = false;
        };

        $scope.deleteAnnotation = function() {
            var params = {
                id: $scope.source._id
            };
            socket.emit('annotations:delete', params);
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
