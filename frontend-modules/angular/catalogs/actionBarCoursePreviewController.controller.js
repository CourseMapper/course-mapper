app.controller('actionBarCoursePreviewController', function ($scope, courseService, authService, toastr, $timeout) {

    $scope.loading = false;

    $scope.enroll = function () {
        $scope.loading = true;
        courseService.enroll(authService.user,

            function () {
                $scope.loading = false;
                toastr.success('You are now enrolled');
                $timeout(function(){
                    window.location.reload();
                });
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
                $timeout(function(){
                    window.location.reload();
                });
            },

            function () {
                $scope.loading = false;
                toastr.error(JSON.stringify(res.errors));
            }
        );
    };
});
