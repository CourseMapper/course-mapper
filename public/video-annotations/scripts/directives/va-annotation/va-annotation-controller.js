videoAnnotationsModule.controller('VaController', ['$scope', 'socket',
    function($scope, socket) {

        this.init = function() {
            $scope.commentText = '';

            var annotationId = $scope.source._id;
            var eventName = annotationId + ':comments:updated';

            socket.on(eventName, function(params) {
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
