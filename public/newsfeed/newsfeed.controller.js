app.controller('NewsfeedController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {
    $scope.courseId = $routeParams.courseId;
    //$scope.nodeId = $routeParams.nodeId;
    $scope.curUrl = $routeParams;

    $scope.newsfeedData = [];
    $scope.filterDropDown = {};
    $scope.filterDateDropDown = "today";
    //$scope.query = "vote";
    $scope.nfType = [
        {"name": "course"},
        {"name": "sub topic"},
        {"name": "content node"},
        {"name": "discussion"},
        // {"name": "link"},
        {"name": "external resource"},
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

    $scope.nfFilterDate = [
        {"name": "today"},
        {"name": "last week"},
        {"name": "last month"}
    ];

    $scope.$watch('filterDateDropDown', function (newValue, oldValue) {

        if ($scope.filterDateDropDown.name == 'today') {
            $http.get('/api/newsfeed/cid/'+$scope.courseId+'/today').success(function (data) {
                $scope.newsfeedData = data.newsfeeds;
                $scope.nfLength = data.newsfeeds.length;
            });
        } else if ($scope.filterDateDropDown.name == 'last week') {
            $http.get('/api/newsfeed/cid/'+$scope.courseId+'/week').success(function (data) {
                $scope.newsfeedData = data.newsfeeds;
                $scope.nfLength = data.newsfeeds.length;
            });
        } else if ($scope.filterDateDropDown.name == 'last month') {
            $http.get('/api/newsfeed/cid/'+$scope.courseId).success(function (data) {
                $scope.newsfeedData = data.newsfeeds;
                $scope.nfLength = data.newsfeeds.length;
            });
        } else {
            $http.get('/api/newsfeed/cid/'+$scope.courseId).success(function (data) {
                $scope.newsfeedData = data.newsfeeds;
                $scope.nfLength = data.newsfeeds.length;
            });
        }

    });

    /*$http.get('/api/newsfeed/cid/'+$scope.courseId).success(function (data) {
        $scope.newsfeedData = data.newsfeeds;
        $scope.nfLength = data.newsfeeds.length;
    });*/



});