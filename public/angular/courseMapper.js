var app = angular.module('courseMapper', ['ngResource', 'ngRoute']);

app.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});;app.controller('MainMenuController', function($scope, $http, $rootScope) {
    $http.get('/api/accounts').success(function(data) {
        $scope.user = data;
        $rootScope.user = data;
    });
});