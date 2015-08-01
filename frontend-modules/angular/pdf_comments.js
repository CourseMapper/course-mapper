app.controller('CommentListController', function($scope, $http, $rootScope, $sce) {

    $http.get('/slide-viewer/disComm').success(function (data) {
        console.log(data);
        $scope.comments = data.comments;
    });

});
