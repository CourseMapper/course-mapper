admin.controller('MainMenuController', function($scope, $http, $rootScope) {
    $http.get('/api/account').success(function(data) {
        $scope.user = data;
        $rootScope.user = data;
 
        $rootScope.$broadcast('onAfterInitUser', $rootScope.user);
    });
});