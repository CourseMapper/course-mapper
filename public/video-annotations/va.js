var videoAnnotationsModule = angular.module('VideoAnnotations', [
    'ngSanitize',
    'ngRoute',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'com.2fdevs.videogular.plugins.overlayplay',
    'info.vietnamcode.nampnq.videogular.plugins.youtube'
]);
;videoAnnotationsModule.controller('VaController', ['$scope', 'socket',
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
;videoAnnotationsModule.directive('videoAnnotation', function() {
    return {
        scope: {
            source: '='
        },
        templateUrl: '/video-annotations/scripts/directives/va-annotation/va-annotation.html',
        controller: 'VaController'
    };
});
;videoAnnotationsModule.controller('VaEditorController', ['$scope', 'socket',
    function($scope, socket) {

        $scope.annotationTypes = [{
            id: 'embedded-note',
            name: 'Embedded Note'
        }, {
            id: 'note',
            name: 'Note'
        }];

        $scope.saveAnnotation = function() {
            var annotation = $scope.annotation;
            var params = {
                annotation: annotation
            };
            socket.emit('annotations:save', params);
            $scope.annotation = null;
        };

        $scope.cancelEdit = function() {
            $scope.annotation = null;
        };

        $scope.deleteAnnotation = function() {
            var params = {
                id: $scope.annotation._id
            };
            socket.emit('annotations:delete', params);
            $scope.annotation = null;
        };
    }
]);
;videoAnnotationsModule.directive('vaEditor', function() {
    return {
        scope: {
            annotation: '='
        },
        templateUrl: '/video-annotations/scripts/directives/va-editor/va-editor.html',
        controller: 'VaEditorController'
    };
});
;videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$sce',
    function($scope, socket, $sce) {

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
                "start": startTime,
                "end": endTime,
                "position": {
                    "top": "20",
                    "left": "20"
                },
                "size": {
                    "height": "100",
                    "width": "200"
                },
                "type": "embedded-note",
                "text": "",
                "author": "Anonymous", //TODO - get author
                "video_id": $scope.videoId
            };
            $scope.selectedAnnotation = defaultAnnotation;
        };

        $scope.seekPosition = function(annotation) {
            console.log(annotation);
            // add .001 to seek time in order to show inline annotations
            $scope.API.seekTime(annotation.start + 0.001);
            $scope.API.pause();
        };

        $scope.onPlayerReady = function(API) {
            $scope.API = API;
        };

        socket.on('annotations:updated', function(annotations) {
            console.log('Loaded annotations: ' + annotations.length);

            // clear current annotations state
            $scope.annotations = [];
            $scope.cuePoints.points = [];
            $scope.selectedAnnotation = null;

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

                    annotation.reposition = function(params) {
                        if (params.position) {
                            annotation.position = params.position;
                        }
                        if (params.size) {
                            annotation.size = params.size;
                        }
                    };

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
;videoAnnotationsModule.directive('vaWidget',
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
