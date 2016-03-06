angular.module('TopContent', [''])
    .controller('TopContentController', function($scope, $http, $location) {
        $scope.HeaderTitle = "Top Content";

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