'use strict';

var videoAnnotationsModule = angular.module('VideoAnnotations', [
    'ngSanitize',
    'ngRoute',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'com.2fdevs.videogular.plugins.overlayplay',
    'info.vietnamcode.nampnq.videogular.plugins.youtube',
    'videogular.plugins.vimeo'
]);
;"use strict";
angular.module("info.vietnamcode.nampnq.videogular.plugins.youtube", [])
  .run(['$rootScope', '$window',
    function ($rootScope, $window) {
      $rootScope.youtubeApiReady = false;
      $window.onYouTubeIframeAPIReady = function () {
        $rootScope.$apply(function () {
          $rootScope.youtubeApiReady = true;
        });
      };
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  ])
  .directive(
    "vgYoutube", ["$rootScope", "$window", "$timeout", "$interval", "VG_STATES",
      function ($rootScope, $window, $timeout, $interval, VG_STATES) {
        return {
          restrict: "A",
          require: "^videogular",
          link: function (scope, elem, attr, API) {
            var ytplayer, updateTimer, optionsArr, playerVars;

            var youtubeReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            optionsArr = attr.vgYoutube !== null ? attr.vgYoutube.split(";") : null;
            playerVars = {
              'controls': 0,
              'showinfo': 0,
              'rel': 0,
              'autoplay': 0, //Switch autoplay to 1 to autoplay videos
              'start': 0
            };

            if (optionsArr !== null) {
              optionsArr.forEach(function (item) {
                var keyValuePair = item.split("=");
                if (playerVars.hasOwnProperty(keyValuePair[0])) {
                  playerVars[keyValuePair[0]] = keyValuePair[1] || 0;
                }
              });
            }

            function getYoutubeId(url) {
              return url.match(youtubeReg)[2];
            }

            function initYoutubePlayer(url) {
              if (ytplayer) {
                ytplayer.cueVideoById({
                  videoId: getYoutubeId(url)
                });
              } else {
                $rootScope.$watch('youtubeApiReady', function (value) {
                  if (value) {
                    ytplayer = new YT.Player(API.mediaElement[0], {
                      videoId: getYoutubeId(url),
                      playerVars: playerVars,
                      events: {
                        'onReady': onVideoReady,
                        'onStateChange': onVideoStateChange
                      }
                    });
                  }
                });
              }
            }

            function destroyYoutubePlayer() {
              ytplayer.destroy();
            }

            function onVideoReady() {
              //Define some property, method for player
              API.mediaElement[0].__defineGetter__("currentTime", function () {
                return ytplayer.getCurrentTime();
              });
              API.mediaElement[0].__defineSetter__("currentTime", function (seconds) {
                return ytplayer.seekTo(seconds, true);
              });
              API.mediaElement[0].__defineGetter__("duration", function () {
                return ytplayer.getDuration();
              });
              API.mediaElement[0].__defineGetter__("paused", function () {
                return ytplayer.getPlayerState() != YT.PlayerState.PLAYING;
              });
              API.mediaElement[0].__defineGetter__("videoWidth", function () {
                return ytplayer.a.width;
              });
              API.mediaElement[0].__defineGetter__("videoHeight", function () {
                return ytplayer.a.height;
              });
              API.mediaElement[0].__defineGetter__("volume", function () {
                return ytplayer.getVolume() / 100.0;
              });
              API.mediaElement[0].__defineSetter__("volume", function (volume) {
                return ytplayer.setVolume(volume * 100.0);
              });
              API.mediaElement[0].play = function () {
                ytplayer.playVideo();
              };
              API.mediaElement[0].pause = function () {
                ytplayer.pauseVideo();
              };
              updateTime(); // Initial time update
              angular.element(ytplayer.getIframe()).css({'width': '100%', 'height': '100%'});

              // Trigger canplay event
              var event = new CustomEvent("canplay");
              API.mediaElement[0].dispatchEvent(event);
            }

            function updateTime() {
              API.onUpdateTime({
                target: API.mediaElement[0]
              });
            }

            function startUpdateTimer(interval) {
              updateTimer = setInterval(updateTime, interval);
            }

            function stopUpdateTimer() {
              if (updateTimer) {
                clearInterval(updateTimer);
              }
            }

            function onVideoStateChange(event) {
              var player = event.target;

              switch (event.data) {
                case YT.PlayerState.ENDED:
                  stopUpdateTimer();
                  API.onComplete();
                  break;

                case YT.PlayerState.PLAYING:
                  // Trigger onStartPlaying event
                  var event = new CustomEvent("playing");
                  API.mediaElement[0].dispatchEvent(event);
                  API.setState(VG_STATES.PLAY);
                  startUpdateTimer(600);
                  break;

                case YT.PlayerState.PAUSED:
                  // NB Videogular calls pause() on the YouTube player to actually stop a video.
                  // Avoid jumping from the desired "stop" status to "pause" status:
                  if (API.currentState == VG_STATES.PLAY) {
                    API.setState(VG_STATES.PAUSE);
                  }
                  stopUpdateTimer();
                  break;

                case YT.PlayerState.BUFFERING:
                  // Trigger onStartBuffering event
                  var event = new CustomEvent("waiting");
                  API.mediaElement[0].dispatchEvent(event);
                  break;

                case YT.PlayerState.CUED:
                  //No appropriate state
                  break;
              }
            }

            function isYoutube(url) {
              if (url) {
                return url.match(youtubeReg);
              }
              return false;
            }

            function onSourceChange(url) {
              if (isYoutube(url)) {
                initYoutubePlayer(url);
              } else {
                if (ytplayer) {
                  destroyYoutubePlayer();
                }
              }
            }

            scope.$watch(
              function () {
                return API.sources;
              },
              function (newVal, oldVal) {
                if (newVal && newVal.length > 0 && newVal[0].src) {
                  onSourceChange(newVal[0].src.toString());
                }
                else {
                  onSourceChange(null);
                }
              }
            );
            scope.$on('$destroy', function () {
              stopUpdateTimer();
            });
          }
        };
      }
    ]);
;'use strict';

videoAnnotationsModule.controller('VaController', ['$scope', 'socket', '$rootScope',
  function ($scope, socket, rootScope) {
    function markAuthoredComments(comments) {
      var user = rootScope.user;
      var isAdmin = user.role === 'admin';

      _.forEach(comments, function (comment) {
        if (isAdmin) {
          comment.canEdit = true;
        } else {
          var isAuthor = comment.author === user.username;
          comment.canEdit = isAuthor;
        }
      });
    }

    this.init = function () {
      $scope.commentText = '';
      var user = rootScope.user;
      var isAdmin = user.role === 'admin';
      if (isAdmin) {
        $scope.canEdit = true;
      } else {
        var isAuthor = $scope.source.author === user.username;
        $scope.canEdit = isAuthor;
      }
      $scope.annotationTypes = [{
        id: 'embedded-note',
        name: 'Embedded Note'
      }, {
        id: 'note',
        name: 'Note'
      }];
      // Listen for changes in comments
      socket.on($scope.source._id + ':comments:updated', function (params) {
        markAuthoredComments(params.comments);
        $scope.source.comments = params.comments;
      });
    };

    $scope.editAnnotation = function () {
      $scope.source.isEditMode = true;
      $scope.$parent.searchHide(true);
      $scope.$parent.seekPosition($scope.source);

      _.each($scope.$parent.annotations, function (a) {
        if (a._id !== $scope.source._id)
          a.isEditMode = false;
      });
    };

    $scope.closeAnnotation = function () {
      $scope.source.isEditMode = false;
      $scope.$parent.searchHide(false);
    };

    $scope.saveAnnotation = function () {
      var annotation = $scope.source;

      if (!annotation.text) return;
      if (annotation.start < 0) return;
      if (annotation.end < annotation.start) return;

      socket.emit('annotations:save', {
        annotation: annotation
      });

      $scope.source.isEditMode = false;
      $scope.source.isDefault = false;
      $scope.$parent.searchHide(false);
    };

    $scope.cancelAnnotation = function () {
      $scope.$parent.annotations.shift();
      $scope.$parent.searchHide(false);
    };

    $scope.deleteAnnotation = function () {
      var params = {
        id: $scope.source._id
      };
      socket.emit('annotations:delete', params);
    };

    $scope.postComment = function () {
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


    $scope.removeComment = function (commentId) {
      var params = {
        annotation_id: $scope.source._id,
        comment_id: commentId
      };
      socket.emit('comments:remove', params);
    };

    this.init();
  }
]);
;'use strict';

videoAnnotationsModule.directive('videoAnnotation', function () {
  return {
    scope: {
      source: '='
    },
    templateUrl: '/js/video-annotations/va-annotation/va-annotation.html',
    controller: 'VaController'
  };
});;'use strict';

videoAnnotationsModule.controller('VaWidgetController', ['$scope', 'socket', '$rootScope', '$http', '$location', '$anchorScroll',
  function ($scope, socket, rootScope, $http, $location, $anchorScroll) {
    var videoPulse;
    var videoPulseHost = 'http://lanzarote.informatik.rwth-aachen.de:3005';

    var onLeave = function (currentTime, timeLapse, params) {
      params.completed = false;
      params.showing = false;
      params.isScrolled = false;
    };

    var onComplete = function (currentTime, timeLapse, params) {
      params.completed = true;
      params.showing = false;
      params.isScrolled = false;
    };

    var onUpdate = function (currentTime, timeLapse, params) {

      if (!params.showing) {
        params.completed = false;
        params.showing = true;
      }

      var scrolled = _.find($scope.annotations, function (a) {
        return a.isScrolled;
      });
      // Scroll to annotation if there
      // isn't a scrolled annotation in the viewer
      if (!scrolled) {
        $location.hash(params._id);
        $anchorScroll();
        params.isScrolled = true;
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

      // Trigger initial annotations update.
      socket.emit('annotations:get', {video_id: videoId});

      var pulseUrl = videoPulseHost + '/beats/' + videoId + '/' + rootScope.user._id;
      $http.get(pulseUrl)
        .success(function (data) {
          var position = (data.pointer / 1000);
          $scope.lastPos = data.pointer;

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
]);;/*jslint node: true */
'use strict';

videoAnnotationsModule.directive('vaWidget',
  function () {
    return {
      restruct: 'A',
      scope: {
        videoSource: '@',
        videoId: '@'
      },
      templateUrl: '/js/video-annotations/va-widget/va-widget.html',
      controller: 'VaWidgetController'
    };
  }
);
;'use strict';

videoAnnotationsModule.directive("vgFootprint", function () {
    return {
      restrict: "E",
      require: "^videogular",
      template: "<div class='fp-timeline' ng-style='timelineWidth'></div>"
    }
  }
);

videoAnnotationsModule.directive("vgFootprintInfo", function () {
    return {
      restrict: "E",
      require: "^videogular",
      template: "<div class='fp-info-data'></div>"
    }
  }
);