admin.controller('applicationsController', function ($scope, $route, $routeParams, $location, $http, $timeout) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.widgets = null;

    $scope.sortType = 'location';
    $scope.sortReverse = false;

    $scope.init = function () {
        $http.get('/api/widgets/all')
            .success(function (res) {
                if (res.result && res.widgets) {
                    $scope.widgets = res.widgets;
                }
            });
    };

    function updateWidgetResult(updated, widgets) {
        for (var i in widgets) {
            var wdg = widgets[i];
            if (wdg.name == updated.name) {
                wdg.isActive = updated.isActive;
            }
        }

        $timeout(function () {
            $scope.$apply()
        });
    }

    $scope.activate = function (app, widgetName) {
        $http.put('/api/widgets/' + app + '/' + widgetName, {
            isActive: true
        }).success(function (res) {
            if (res.result && res.widget) {
                res.widget.isActive = true;
                updateWidgetResult(res.widget, $scope.widgets);
            }
        });
    };

    $scope.deactivate = function (app, widgetName) {
        $http.put('/api/widgets/' + app + '/' + widgetName, {
            isActive: false
        }).success(function (res) {
            if (res.result && res.widget) {
                res.widget.isActive = false;
                updateWidgetResult(res.widget, $scope.widgets);
            }
        });
    };

    $scope.init();

});