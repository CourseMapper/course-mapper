app.controller('CourseController', function($scope, $filter, $http, $location, $routeParams) {
    $scope.course = null;
    $scope.enrolled = false;
    $scope.loc = $location.absUrl() ;
    $scope.shortId = $scope.loc[$scope.loc.length -1];

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $http.get('/api/course/' + $scope.shortId).success(function(res){
        if(res.result)
            $scope.course = res.course;
    });

    $scope.enroll = function(){
        var url = '/api/course/' + $scope.course._id + '/enroll';
        $scope.loading = true;
        $http.put(url, {}).success(function(res){

        }).finally(function(){
            $scope.loading = false;
        });
    }
});