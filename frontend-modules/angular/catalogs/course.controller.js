app.controller('CourseController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {

    $scope.courseId = $routeParams.courseId;
    $scope.course = null;
    $scope.videoSources = false;
    $scope.isPlaying = false;
    $scope.actionBarTemplate = 'actionBar-course-preview';

    $scope.tabOpened = function () {
        $scope.actionBarTemplate = 'actionBar-course-preview';

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

    $scope.enroll = function () {
        $scope.loading = true;
        courseService.enroll(authService.user,

            function () {
                $scope.loading = false;
                toastr.success('You are now enrolled');
            },

            function (res) {
                $scope.loading = false;
                toastr.error(JSON.stringify(res.errors));
            }
        );

    };

    $scope.leave = function () {
        $scope.loading = true;

        courseService.leave(authService.user,
            function () {
                $scope.loading = false;
                toastr.success('You left the course');
            },

            function () {
                $scope.loading = false;
                toastr.error(JSON.stringify(res.errors));
            }
        );
    };

    /**
     * init tabs
     */
    $scope.tabOpened();
});
