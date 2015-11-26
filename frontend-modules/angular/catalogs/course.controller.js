app.controller('CourseController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {

    $scope.courseId = $routeParams.courseId;
    $scope.course = null;
    $scope.videoSources = false;
    $scope.isPlaying = false;

    $scope.tabOpened = function () {
        if (courseService.course) {
            $scope.course = courseService.course;
            $scope.initTab($scope.course);
        } else {
            $scope.$on('onAfterInitCourse', function (event, course, refreshPicture) {
                $scope.initTab(course, refreshPicture);
            });
        }

        $rootScope.$broadcast('onCoursePreviewTabOpened', $scope.currentTab);
    };

    $scope.initTab = function (course, refreshPicture) {
        $scope.course = course;

        if (refreshPicture) {
            if ($scope.course.picture)
                $scope.course.picture = $scope.course.picture + '?' + new Date().getTime();
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

    /**
     * init tabs
     */
    $scope.tabOpened();
});
