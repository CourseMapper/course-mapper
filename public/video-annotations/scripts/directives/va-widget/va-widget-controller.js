/* jslint node: true */
'use strict';

videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$rootScope',
    function($scope, socket, rootScope) {

        var onLeave = function(currentTime, timeLapse, params) {
            params.completed = false;
            params.showing = false;
        };

        var onComplete = function(currentTime, timeLapse, params) {
            params.completed = true;
            params.showing = false;
        };

        var onUpdate = function(currentTime, timeLapse, params) {
            if (!params.showing) {
                params.completed = false;
                params.showing = true;
            }
        };

        var checkIsAuthor = function(item) {
            return (item.author === rootScope.user.username);
        };

        $scope.createAnnotation = function() {
            // If the first annotation is the default,
            // then do not allow adding another one.
            if ($scope.annotations.length > 0 &&
                $scope.annotations[0].isDefault) {
                return;
            }
            _.each($scope.annotations, function(a) {
                a.isEditMode = false;
            });

            // get current playback time and add
            // default offset seconds for the end of
            // the annotation
            var startTime = $scope.API.currentTime;
            var endTime = $scope.API.currentTime + (5 * 1000);

            var defaultAnnotation = {
                "isEditMode": true,
                "isDefault": true,
                "isAuthor": true,
                "start": startTime,
                "end": endTime,
                "position": {
                    "top": "10",
                    "left": "10"
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
            $scope.hideSearch = true;
            $scope.query = '';
        };

        $scope.searchHide = function(value) {
            $scope.hideSearch = value;
        };

        $scope.seekPosition = function(annotation) {
            $scope.API.seekTime(annotation.start / 1000);
            //$scope.API.pause();
        };

        $scope.onPlayerReady = function(API) {
            $scope.API = API;
        };

        socket.on('annotations:updated', function(annotations) {
            // clear current annotations state
            $scope.annotations = [];
            $scope.cuePoints.points = [];
            $scope.selectedAnnotation = null;

            _.sortByAll(annotations, ['start', 'end'])
                .forEach(function(annotation) {
                    var cuePoint = {
                        timeLapse: {
                            start: (new Date(annotation.start).getTime() - 0.001) / 1000,
                            end: new Date(annotation.end).getTime() / 1000
                        },
                        onLeave: onLeave,
                        onUpdate: onUpdate,
                        onComplete: onComplete,
                        params: annotation
                    };
                    $scope.cuePoints.points.push(cuePoint);

                    annotation.isAuthor = checkIsAuthor(annotation);
                    annotation.reposition = function(params) {
                        if (params.position) {
                            annotation.position = params.position;
                        }
                        if (params.size) {
                            annotation.size = params.size;
                        }
                    };
                    $scope.annotations.push(annotation);

                    // find current user comments
                    _.forEach(annotation.comments, function(c) {
                        c.isAuthor = checkIsAuthor(c);
                    });
                });
        });

        $scope.getInlineAnnotationStyle = function(item) {
            return {
                'top': item.position.top + '%',
                'left': item.position.left + '%',
                'width': item.size.width + '%',
                'z-index': item.isEditMode ? 1 : 0,
                'height': item.size.height + '%',
                'background': item.isHovered ? 'rgba(0, 0, 0, 0.3)' : 'background: rgba(0, 0, 0, 0.05)'
            };
        };

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
