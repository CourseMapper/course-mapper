app.controller('WidgetGalleryController', function ($scope, $http, $rootScope, toastr) {
    $scope.location = "";
    $scope.installedWidgets;
    /**
     * get widgets store data from the server
     */
    $scope.initData = function (location) {
        $scope.location = location;

        $http.get('/api/widgets/' + location).success(function (data) {
            $scope.widgets = data.widgets;
        });
    };

    $scope.$watch('location', function(newVal, oldVal) {
        var onafter = 'onAfterGetWidgets' + $scope.location;
        $scope.$on(onafter, function (event, installedWidgets) {
            $scope.installedWidgets = installedWidgets;
        });

        var onCloseButtonClicked = 'onAfterCloseButtonClicked' + $scope.location;
        $scope.$on(onCloseButtonClicked, function (event, widget) {
             $scope.uninstall(widget._id);
        });
    });

    $scope.isInstalled = function(widgetId){
        if($scope.installedWidgets){
            var isInstalled = _.find($scope.installedWidgets, {widgetId:{_id: widgetId}});
            return isInstalled;
        }

        return false;
    };

    $scope.install = function(location, application, name, courseId){
        var params = {
            application: application,
            widget: name,
            location: location
        };

        if(courseId)
            params.courseId = courseId;

        $http.put('/api/widgets/install', params)
            .success(function (data) {
                if(data.result)
                    $scope.installedWidget = data.installed;

                // hide the widget gallery
                $('#widgetGallery').modal('hide');

                $rootScope.$broadcast('onAfterInstall' + location, $scope.installedWidget);

                toastr.success('Widget is installed');
            })
            .error(function(data){
                toastr.error('Installation failed');
            });
    };

    $scope.uninstall = function(installId){
        $http.put('/api/widgets/uninstall/' + installId, {})
            .success(function (data) {
                if(data.result) {
                    $scope.uninstalledWidget = data.uninstalled;

                    // hide the widget gallery
                    $('#widgetGallery').modal('hide');

                    $rootScope.$broadcast('onAfterUninstall' + data.uninstalled.location, $scope.uninstalledWidget);

                    toastr.success('Widget is uninstalled');
                }
            })
            .error(function(data){
                toastr.error('Uninstallation failed');
            });
    };

});
