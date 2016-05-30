admin.controller('CategoryRecommendationsController', function ($scope, $route, $routeParams, $location, $http, $timeout) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.categories = [];

    $scope.init = function () {
        $http.get('/api/categories/recommendations').success(function (res) {
            if (res.result && res.categories) {
                $scope.categories = res.categories;
            }
        });
    };

    $scope.delete = function (recId) {
        $http.delete('/api/categories/recommendation/' + recId, {})
            .success(function (res) {
                if (res.result) {
                    for (var i = 0; i < $scope.categories.length; i++) {
                        $scope.categories.splice(i, 1);
                        break;
                    }

                    $timeout(function () {
                        $scope.$apply();
                    })
                }
            });
    };

    $scope.init();

});