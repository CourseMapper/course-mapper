admin.controller('tabsController', function ($scope, $route, $routeParams, $location, $http, $timeout) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.tabs = null;

    $scope.init = function () {
        $http.get('/api/tabs/all').success(function (res) {
            if (res.result && res.tabs) {
                $scope.tabs = res.tabs;
            }
        });
    };

    function updateTabResult(updated, tabs) {
        for (var i in tabs) {
            var wdg = tabs[i];
            if (wdg.name == updated.name) {
                wdg.isActive = updated.isActive;
            }
        }

        $timeout(function () {
            $scope.$apply()
        });
    }

    $scope.activate = function (tabName) {
        $http.put('/api/tabs/' + tabName, {
            isActive: true
        }).success(function (res) {
            if (res.result && res.tab) {
                res.tab.isActive = true;
                updateTabResult(res.tab, $scope.tabs);
            }
        });
    };

    $scope.deactivate = function (tabName) {
        $http.put('/api/tabs/' + tabName, {
                isActive: false
            })
            .success(function (res) {
                if (res.result && res.tab) {
                    res.tab.isActive = false;
                    updateTabResult(res.tab, $scope.tabs);
                }
            });
    };

    $scope.init();

});