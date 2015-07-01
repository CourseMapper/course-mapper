admin.controller('applicationsController', function($scope, $route, $routeParams, $location, $http) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.allApps = null;

    $scope.init = function(){
        $http.get('/api/apps/all').success(function(res){
            if(res.result && res.apps){
                $scope.allApps = res.apps;
            }
        });
    };

    $scope.activateApp = function(app){
        alert(app);
    };

    $scope.init();

});