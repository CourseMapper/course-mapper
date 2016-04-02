app.controller('NewsfeedNodeController', function ($scope, $rootScope, $filter, $http,
                                               $location, $routeParams, $timeout,
                                               courseService, authService, toastr, Page) {
    $scope.courseId = $routeParams.courseId;
    $scope.nodeId = $routeParams.nodeId;
    $scope.curUrl = $routeParams;

    $scope.newsfeedData = [];
    $scope.filterDropDown = {};
    //$scope.query = "vote";


    $scope.nfNodeType = [
        {"name": "content node"},
        {"name": "link"},
        {"name": "pdf annotation"},
        {"name": "video annotation"},
        {"name": "vote"}

    ];

    $http.get('/api/newsfeed-node/cid/'+$scope.courseId+'/nid/'+$scope.nodeId).success(function (data) {
        $scope.newsfeedData = data.newsfeeds;
        $scope.nfLength = data.newsfeeds.length;
    });


});