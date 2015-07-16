app.controller('CommentListController', function($scope, $http, $rootScope) {

    $http.get('/slide-viewer/disComm').success(function (data) {
        console.log("Inside http get");
        $scope.comments = data;
    });

});
