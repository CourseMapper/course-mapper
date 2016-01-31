app.controller('NewsfeedNodeController', function ($scope, $rootScope, $filter, $http,
                                               $location, $routeParams, $timeout,
                                               courseService, authService, toastr, Page) {
    $scope.courseId = $routeParams.courseId;

    $scope.newsfeedData = [];
    $scope.filterDropDown = {};
    //$scope.query = "vote";


    $scope.nfNodeType = [
        {"name": "pdf annotation"},
        {"name": "video annotation"},
        {"name": "link"}
    ];

    $http.get('/api/newsfeed-node/'+$scope.courseId).success(function (data) {
        $scope.newsfeedData = data.newsfeeds;
        $scope.nfLength = data.newsfeeds.length;
    });


});