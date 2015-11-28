app.controller('NewsfeedController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {
    $scope.courseId = $routeParams.courseId;

    $http.get('/api/newsfeed/'+$scope.courseId).success(function (data) {
        $scope.newsfeedData = data.newsfeeds;
    });


});