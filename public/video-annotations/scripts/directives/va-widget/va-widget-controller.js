/*jslint node: true */
'use strict';

videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$rootScope',
    function($scope, socket, rootScope) {
        var currentUser = rootScope.user;

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
                "video_id": $scope.videoId
            };
            $scope.selectedAnnotation = defaultAnnotation;
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
