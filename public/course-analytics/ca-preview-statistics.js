angular.module('PreviewStats', [''])
    .controller('PreviewStatsController', function($scope, $http, $location, $log) {
        //$scope.HeaderTitle = "User Name";

        var loc = $location.path();
        var parseLoc = loc.replace ('/cid/', '');
        //alert(parseLoc);
        if (parseLoc) {

            $http.get('/api/course-analytics/' + parseLoc).success(function (data) {
                //$scope.data = data;
                $scope.userList = data.courses;

            });

            $http.get('/api/treeNodes/course/' + parseLoc).success(function(data){
                $scope.treeNodes = data.treeNodes;
            });

            $http.get('/api/discussions/' + parseLoc).success(function(data){
                $scope.discussions = data.posts;
            });
        } else
            console.log('cannot get courseId in analytic widget');

    });