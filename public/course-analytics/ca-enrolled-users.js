angular.module('EnrolledUsers', [''])
    .controller('UserListEnrolledController', function($scope, $http, $location) {
        $scope.title = "List of User that Enrolled in This Course";

        var loc = $location.path();
        var parseLoc = loc.replace ('/cid/', '');
        //alert(parseLoc);
        if (parseLoc) {

            $http.get('/api/course-analytics/' + parseLoc).success(function (data) {
                $scope.userList = data.courses;

            });
        } else
            console.log('cannot get courseId in analytic widget');

    });