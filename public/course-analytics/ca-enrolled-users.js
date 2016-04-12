angular.module('EnrolledUsers', [''])
    .controller('UserListEnrolledController', function($scope, $http, $location) {
        $scope.HeaderTitle = "User Name";

        var loc = $location.path();
        var parseLoc = loc.replace ('/cid/', '');
        //alert(parseLoc);
        if (parseLoc) {

            $http.get('/api/course-analytics/user-list/' + parseLoc).success(function (data) {
                $scope.userList = data.courses;

            });
        } else
            console.log('cannot get courseId in analytic widget');

    });