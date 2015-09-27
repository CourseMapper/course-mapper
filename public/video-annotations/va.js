/*jslint node: true */
'use strict';

var videoAnnotationsModule = angular.module('VideoAnnotations', [
    'ngSanitize',
    'ngRoute',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'com.2fdevs.videogular.plugins.overlayplay',
    'info.vietnamcode.nampnq.videogular.plugins.youtube'
]);
;/*jslint node: true */
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
            $scope.isAuthor = ($scope.source.author === currentUser.username);
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
;/*jslint node: true */
'use strict';

videoAnnotationsModule.directive('videoAnnotation', function() {
    return {
        scope: {
            source: '='
        },
        templateUrl: '/video-annotations/scripts/directives/va-annotation/va-annotation.html',
        controller: 'VaController'
    };
});
;/*jslint node: true*/
'use strict';

videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$rootScope',
    function($scope, socket, rootScope) {

        var onLeave = function onLeave(currentTime, timeLapse, params) {
            params.completed = false;
            params.showing = false;
        };

        var onComplete = function onComplete(currentTime, timeLapse, params) {
            params.completed = true;
            params.showing = false;
        };

        var onUpdate = function onUpdate(currentTime, timeLapse, params) {
            if (!params.showing) {
                params.completed = false;
                params.showing = true;
            }
        };

        $scope.createAnnotation = function() {
            // get current playback time
            var startTime = Math.floor($scope.API.currentTime / 1000);
            var endTime = startTime + 5;

            var defaultAnnotation = {
                "isEditMode": true,
                "start": startTime,
                "end": endTime,
                "position": {
                    "top": "20",
                    "left": "20"
                },
                "size": {
                    "height": "20",
                    "width": "30"
                },
                "type": "embedded-note",
                "text": "",
                "video_id": $scope.videoId
            };
            $scope.annotations.unshift(defaultAnnotation);
        };

        $scope.seekPosition = function(annotation) {
            // add .001 to seek time in order to show inline annotations
            $scope.API.seekTime(annotation.start + 0.001);
            $scope.API.pause();
        };

        $scope.onPlayerReady = function(API) {
            $scope.API = API;
        };

        socket.on('annotations:updated', function(annotations) {
            // clear current annotations state
            $scope.annotations = [];
            $scope.cuePoints.points = [];
            $scope.selectedAnnotation = null;

            var currentUser = rootScope.user;

            _.sortBy(annotations, 'start')
                .forEach(function(annotation) {
                    var cuePoint = {
                        timeLapse: {
                            start: annotation.start,
                            end: annotation.end
                        },
                        onLeave: onLeave,
                        onUpdate: onUpdate,
                        onComplete: onComplete,
                        params: annotation
                    };
                    annotation.isAuthor = (annotation.author === currentUser.username);
                    annotation.reposition = function(params) {
                        if (params.position) {
                            annotation.position = params.position;
                        }
                        if (params.size) {
                            annotation.size = params.size;
                        }
                    };

                    _.forEach(annotation.comments, function(comment) {
                        comment.isAuthor = (comment.author === currentUser.username);
                    });

                    $scope.annotations.push(annotation);
                    $scope.cuePoints.points.push(cuePoint);
                });
        });

        $scope.init = function(videoId, videoSource) {
            $scope.sources = [{
                src: videoSource,
                type: 'video/mp4'
            }];

            $scope.cuePoints = {
                points: []
            };
            $scope.annotations = [];

            // Trigger initial annotations update.
            socket.emit('annotations:get', {
                video_id: videoId
            });
        };

        // Initialize scope when the video-source is set.
        $scope.$watch('videoSource', function(oldVal, newVal) {
            if (oldVal !== newVal) {
                $scope.init($scope.videoId, $scope.videoSource);
            }
        });
    }
]);
;/*jslint node: true */
'use strict';

videoAnnotationsModule.directive('vaWidget',
    function() {
        return {
            restruct: 'A',
            scope: {
                videoSource: '@',
                videoId: '@'
            },
            templateUrl: '/video-annotations/scripts/directives/va-widget/va-widget.html',
            controller: 'VaWidgetController'
        };
    }
);
