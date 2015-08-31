videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$sce',
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
                "video_id": $scope.resource._id
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

        this.init = function() {
            $scope.cuePoints = {
                points: []
            };
            $scope.annotations = [];
            $scope.API = null;

            var videoSource = $scope.resource.link;
            $scope.sources = [{
                src: $sce.trustAsResourceUrl(videoSource.src),
                type: 'video/mp4'
            }];

            // get annotations
            var params = {
                video_id: videoSource.id
            };
            socket.emit('annotations:get', params);
        };

        // Initialize controller
        this.init();
    }
]);
