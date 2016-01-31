app.controller('NewsfeedController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {
    $scope.courseId = $routeParams.courseId;

    $scope.newsfeedData = [];
    $scope.filterDropDown = {};
    //$scope.query = "vote";
    $scope.nfType = [
        {"name": "course"},
        {"name": "sub topic"},
        {"name": "content node"},
        {"name": "node"},
        {"name": "discussion"}
    ];


    $http.get('/api/newsfeed/'+$scope.courseId).success(function (data) {
        $scope.newsfeedData = data.newsfeeds;
        $scope.nfLength = data.newsfeeds.length;
    });


});