admin.controller('applicationsController', function($scope, $route, $routeParams, $location, $http) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.widgets = null;

    $scope.init = function(){
        $http.get('/api/widgets/all').success(function(res){
            if(res.result && res.widgets){
                $scope.widgets = res.widgets;
            }
        });
    };

    function updateWidgetResult(updated, widgets){
        for(var i in widgets){
            var wdg = widgets[i];
            if(wdg.name == updated.name){
                wdg.isActive = updated.isActive;
            }
        }
    }

    $scope.activate = function(app, widgetName){
        $http.put('/api/widgets/' + app + '/' + widgetName, {
            isActive:true
        }).success(function(res){
            if(res.result && res.widget){
                updateWidgetResult(res.widget, $scope.widgets);
            }
        });
    };

    $scope.deactivate = function(app, widgetName){
        $http.put('/api/widgets/' + app + '/' + widgetName, {
            isActive:false
        }).success(function(res){
            if(res.result && res.widget){
                updateWidgetResult(res.widget, $scope.widgets);
            }
        });
    };

    $scope.init();

});