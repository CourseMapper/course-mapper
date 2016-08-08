angular.module('PreviewStats', [''])
    .controller('PreviewStatsController', function($scope, $http, $location, $log) {
        //$scope.HeaderTitle = "User Name";

        $scope.isTrue = function (action) {
            return action.isDeleted == false;
        };
        
        var loc = $location.path();
        var parseLoc = loc.replace ('/cid/', '');
        //alert(parseLoc);
        if (parseLoc) {

            /*$http.get('/api/course-analytics/' + parseLoc).success(function (data) {
                //$scope.data = data;
                $scope.userList = data.courses;

            });*/
            $http.get('/api/course-analytics/course-stats/total-user/' + parseLoc).success(function (data) {
                $scope.totalUser = data.userEnrolled;
            });

            $http.get('/api/course-analytics/course-stats/total-video/' + parseLoc).success(function (data) {
                $scope.totalVideo = data.totalVideo;
            });

            $http.get('/api/course-analytics/course-stats/total-pdf/' + parseLoc).success(function (data) {
                $scope.totalPdf = data.totalPdf;
            });

            $http.get('/api/course-analytics/course-stats/total-discussion/' + parseLoc).success(function (data) {
                $scope.totalDiscussion = data.totalDiscussion;
            });

            $http.get('/api/course-analytics/course-stats/course-creator/' + parseLoc).success(function (data) {
                $scope.creator = data.creator;
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