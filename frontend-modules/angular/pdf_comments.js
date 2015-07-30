app.controller('CommentListController', function($scope, $http, $rootScope, $sce) {

    $http.get('/slide-viewer/disComm').success(function (data) {
        console.log("Inside http get");
        $scope.comments = $sce.trustAsHtml(data);
    });

});
