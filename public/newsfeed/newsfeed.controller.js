app.controller('NewsfeedController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {
    $scope.courseId = $routeParams.courseId;
    $scope.nodeId = $routeParams.nodeId;
    $scope.curUrl = $routeParams;

    $scope.newsfeedData = [];
    $scope.filterDropDown = {};
    //$scope.query = "vote";
    $scope.nfType = [
        {"name": "course"},
        {"name": "sub topic"},
        {"name": "content node"},
        {"name": "discussion"},
        {"name": "link"},
        {"name": "pdf annotation"},
        {"name": "video annotation"},
        {"name": "vote"}
    ];
    $scope.nfNodeType = [
        {"name": "content node"},
        {"name": "link"},
        {"name": "pdf annotation"},
        {"name": "video annotation"}

    ];


    $http.get('/api/newsfeed/cid/'+$scope.courseId).success(function (data) {
        $scope.newsfeedData = data.newsfeeds;
        $scope.nfLength = data.newsfeeds.length;
    });



});