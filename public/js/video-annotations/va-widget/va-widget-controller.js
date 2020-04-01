'use strict';

videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$rootScope', '$http', '$location',
  function ($scope, socket, rootScope, $http, $location) {
    $scope.user = rootScope.user;

    var videoPulse;
    var videoPulseHost = 'http://lanzarote.informatik.rwth-aachen.de:3005';
    var startTime = 0;
    var cuePointsFilter;

    var onLeave = function (currentTime, timeLapse, params) {
      params.completed = false;
      params.showing = false;
    };

    var onComplete = function (currentTime, timeLapse, params) {
      params.completed = true;
      params.showing = false;
    };

    var onUpdate = function (currentTime, timeLapse, params) {
      if (!params.showing) {
        params.completed = false;
        params.showing = true;
      }

      if (startTime > 0) {
        $scope.API.seekTime(startTime / 1000);
        startTime = -1; // Disable secondary seek
      }
    };

    var checkCanEdit = function (item) {
      var user = rootScope.user;
      var isAuthor = item.author === user.username;
      var isAdmin = user.role === 'admin';
      return (isAuthor || isAdmin);
    };

    $scope.createAnnotation = function () {
      // If the first annotation is the default,
      // then do not allow adding another one.
      if ($scope.annotations.length > 0 &&
        $scope.annotations[0].isDefault) {
        return;
      }
      _.each($scope.annotations, function (a) {
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
        "canEdit": true,
        "isPrivate": false,
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
        "type": "note",
        "text": "",
        "video_id": $scope.videoId
      };
      $scope.annotations.unshift(defaultAnnotation);
      $scope.hideSearch = true;
      $scope.query = '';
    };

    $scope.searchHide = function (value) {
      $scope.hideSearch = value;
    };

    $scope.seekPosition = function (annotation) {
      $scope.API.seekTime(annotation.start / 1000);
    };

    $scope.onPlayerReady = function (API) {
      // Bootstrap footprint
      new Footprint({
        type: 'video',
        controls: false,
        timeupdate: false,
        sliderHolder: '.fp-timeline',
        infoHolder: '.fp-info-data'
      });
      $scope.API = API;
    };

    socket.on($scope.videoId + ':annotations:invalidate', function (annotations) {
      socket.emit('annotations:get', {video_id: $scope.videoId});
    });

    socket.on($scope.videoId + ':annotations:updated', function (annotations) {

      var editedAnnotation = null;
      if ($scope.annotations && $scope.annotations.length > 0) {
        editedAnnotation = _.find($scope.annotations, function (ann) {
          return ann.isEditMode;
        });
      }

      // clear current annotations state
      $scope.annotations = [];
      $scope.selectedAnnotation = null;

      //Restore annotation that the user is editing.
      if (editedAnnotation) {
        $scope.annotations.push(editedAnnotation);
      }

      var sorted = _.sortBy(annotations, ['start']);
      $scope.cuePoints.points = buildCuePoints(sorted, cuePointsFilter);
      sorted.forEach(function (annotation) {

        //Set startup time
        if (annotation._id === $location.hash() && startTime !== -1) {
          startTime = annotation.start;
        }

        annotation.canEdit = checkCanEdit(annotation);
        annotation.reposition = function (params) {
          if (params.position) {
            annotation.position = params.position;
          }
          if (params.size) {
            annotation.size = params.size;
          }
        };
        $scope.annotations.push(annotation);
        // find current user comments
        _.forEach(annotation.comments, function (c) {
          c.canEdit = checkCanEdit(c);
        });
      });
    });

    var buildCuePoints = function (annotations, filter) {
      var points = [];
      _.filter(annotations, filter)
        .forEach(function (annotation) {
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
          points.push(cuePoint);
        });

      return points;
    };

    $scope.getInlineAnnotationStyle = function (item) {
      return {
        'top': item.position.top + '%',
        'left': item.position.left + '%',
        'width': item.size.width + '%',
        'z-index': item.isEditMode ? 1 : 0,
        'height': item.size.height + '%',
        'background': item.isHovered ? 'rgba(0, 0, 0, 0.3)' : 'background: rgba(0, 0, 0, 0.05)'
      };
    };


    $scope.isAMapPersonalChange = function () {
      if ($scope.isAMapPersonal) {
        cuePointsFilter = function (annotation) {
          return annotation.authorId === rootScope.user._id;
        };
      }
      else {
        cuePointsFilter = null;
      }
      $scope.cuePoints.points = buildCuePoints($scope.annotations, cuePointsFilter);
    };

    $scope.init = function (videoId, videoSource) {
      $scope.sources = [{
        src: videoSource,
        type: 'video/mp4'
      }];

      // Stop any previous pulse
      if (videoPulse) {
        videoPulse.stop();
      }
      videoPulse = new VideoPulse({
        host: videoPulseHost,
        userId: rootScope.user._id,
        videoId: videoId,
        mediaElement: $scope.API
      });

      $scope.cuePoints = {points: []};
      $scope.annotations = [];
      $scope.selectedBar = '';
      $scope.isAMapPersonal = false;

      // Trigger initial annotations update.
      socket.emit('annotations:get', {video_id: videoId});

      var pulseUrl = videoPulseHost + '/beats?key=' + videoId + '&user=' + rootScope.user._id;
      $http.get(pulseUrl)
        .success(function (data) {
          if (data.length <= 0) {
            return;
          }

          var beat=data[0];
          var position = (beat.value / 1000);
          $scope.lastPos = beat.value;

          if (position >>> 0) {
            $scope.onClickedResume = function () {
              $scope.API.seekTime(position);
            }
          }
        });
    };

    // Initialize scope when the video-source is set.
    $scope.$watch('videoSource', function (oldVal, newVal) {
      if (newVal) {
        $scope.init($scope.videoId, $scope.videoSource);
      }
    });

    $scope.onUpdateState = function (state) {
      rootScope.$broadcast('onVideoUpdateState', {'state': state, 'API': $scope.API});
      if (state === 'play') {
        videoPulse.start();
      } else {
        videoPulse.stop();
      }
    };
  }
]);