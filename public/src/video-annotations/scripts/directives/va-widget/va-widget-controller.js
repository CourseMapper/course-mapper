'use strict';

videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$rootScope', '$http',
  function ($scope, socket, rootScope, $http) {
    var videoPulse;

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

    socket.on('annotations:updated', function (annotations) {
      var editedAnnotation = null;
      if ($scope.annotations && $scope.annotations.length > 0) {
        editedAnnotation = _.find($scope.annotations, function (ann) {
          return ann.isEditMode;
        });
      }
      // clear current annotations state
      $scope.annotations = [];
      $scope.cuePoints.points = [];
      $scope.selectedAnnotation = null;

      //Restore annotation that the user is editing.
      if (editedAnnotation) {
        $scope.annotations.push(editedAnnotation);
      }

      var sorted = _.sortByAll(annotations, ['start']);
      sorted.forEach(function (annotation) {
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

    $scope.init = function (videoId, videoSource) {
      $scope.sources = [{
        src: videoSource,
        type: 'video/mp4',
        video_id: videoId
      }];
      // Stop any previous pulse
      if (videoPulse) {
        videoPulse.stop();
      }
      videoPulse = new VideoPulse({
        host: 'http://lanzarote.informatik.rwth-aachen.de:3005',
        userId: rootScope.user._id,
        videoId: videoId,
        mediaElement: $scope.API
      });

      $scope.cuePoints = {points: []};
      $scope.annotations = [];

      // Trigger initial annotations update.
      socket.emit('annotations:get', {video_id: videoId});
    };

    // Initialize scope when the video-source is set.
    $scope.$watch('videoSource', function (oldVal, newVal) {
      if (newVal) {
        $scope.init($scope.videoId, $scope.videoSource);
      }
    });

    var resumeLastPlaybackState = function () {
      var user = rootScope.user;
      var videoId = $scope.API.sources[0].video_id;
      var url = 'http://lanzarote.informatik.rwth-aachen.de:3005/beats/' + videoId + '/' + user._id;
      $http.get(url)
        .success(function (data) {
          if (!data || !data.timestamp) {
            return;
          }
          console.log('Resuming position: ' + data.timestamp);
          $scope.API.seekTime(data.timestamp / 1000);
        });
    };

    $scope.onUpdateState = function (state) {

      rootScope.$broadcast('onVideoUpdateState', {'state': state, 'API': $scope.API});
      if (state === 'play') {
        videoPulse.start();
      } else {
        videoPulse.stop();
      }
    }
  }
]);