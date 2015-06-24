app.controller('CourseController', function($scope, $rootScope, $filter, $http, $location, $routeParams) {
    $scope.course = null;
    $scope.enrolled = false;
    $scope.loc = $location.absUrl() ;
    $scope.courseId = $routeParams.courseId;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $http.get('/api/course/' + $scope.courseId).success(function(res){
        if(res.result)
            $scope.course = res.course;
    });

    $rootScope.$watch('user', function(){
        if($rootScope.user)
        $http.get('/api/accounts/' + $rootScope.user._id + '/course/' + $scope.courseId ).success(function(res){
            if(res.result && res.courses) {
                // this user is enrolled
                $scope.course = res.courses.course;
                $scope.enrolled = res.courses.isEnrolled;
            }
        });
    });


    $scope.enroll = function(){
        var url = '/api/course/' + $scope.course._id + '/enroll';
        $scope.loading = true;
        $http.put(url, {}).success(function(res){
            if(res.result)
                $scope.enrolled = true;
        }).finally(function(){
            $scope.loading = false;
        });
    };

    $scope.leave = function(){
        var url = '/api/course/' + $scope.course._id + '/leave';
        $scope.loading = true;
        $http.put(url, {}).success(function(res){
            if(res.result){
                // success leaving
                $scope.enrolled = false;
            }
        }).finally(function(){
            $scope.loading = false;
        });
    }
});