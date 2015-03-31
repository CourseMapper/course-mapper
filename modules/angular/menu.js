app.controller('MainMenuController', function($scope, $http) {
    $http.get('/api/accounts').success(function(data) {
        $scope.user = data;
    });
});