app.controller('CourseController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {

  $scope.courseId = $routeParams.courseId;
  $scope.course = null;
  $scope.videoSources = false;
  $scope.isPlaying = false;
  $scope.isDeleted = false;
  $scope.isFavorite = null;

  var checkFavorite = function () {
    var course = $scope.course;
    if (!course) return;

    $http.get('/api/favorites/' + course._id)
      .then(function (result) {
        $scope.isFavorite = result.data.isFavorite;
      })
  };

  $scope.tabOpened = function () {
    if (courseService.course) {
      $scope.course = courseService.course;
      $scope.initTab($scope.course);
    } else {
      $scope.$on('onAfterInitCourse', function (event, course, refreshPicture) {
        $scope.initTab(course, refreshPicture);
      });
    }
    checkFavorite();
    $rootScope.$broadcast('onCoursePreviewTabOpened', $scope.currentTab);
  };

  $scope.initTab = function (course, refreshPicture) {
    $scope.course = course;

    if (refreshPicture) {
      if ($scope.course.picture) {
        $scope.course.picture = $scope.course.picture + '?' + new Date().getTime();
      }
    }

    if ($scope.course.video) {
      $scope.videoSources = [{
        src: $scope.course.video,
        type: 'video/mp4'
      }];
    }

    Page.setTitleWithPrefix($scope.course.name + ' > Preview');
  };

  $scope.playVideo = function () {
    $scope.isPlaying = true;
  };

  $scope.stopVideo = function () {
    $scope.isPlaying = false;
  };

  $scope.enroll = function () {
    $scope.loading = true;
    if (!authService.user) {
      toastr.warning("Please Login to Enroll.", {preventDuplicates: false});
    }
    else
      courseService.enroll(authService.user,

        function () {
          $scope.loading = false;
          toastr.success('You are now enrolled.');
          $timeout(function () {
            window.location.reload();
          });
        },

        function (res) {
          $scope.loading = false;
          toastr.error(JSON.stringify(res.errors));
        }
      );
  };

  $scope.toggleFavorite = function () {
    if ($scope.isFavorite === null) return;

    var method = $scope.isFavorite === true ? 'DELETE' : 'POST';

    $http({
      method: method,
      url: '/api/favorites/' + $scope.course._id
    }).then(
      function (result) {
        $scope.isFavorite = !$scope.isFavorite;
        if ($scope.isFavorite) {
          toastr.success('Added course to favorites.');
        } else {
          toastr.success('Removed course from favorites.');
        }
        $scope.$emit('favorites.update');
      },
      function (err) {
        var op = $scope.isFavorite ? 'remove from' : 'add to';
        toastr.error('Failed to ' + op + ' favorites.');
      })
  };

  /**
   * init tabs
   */
  $scope.tabOpened();
});
