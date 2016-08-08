app.controller('WidgetGalleryController', function ($scope, $http, $rootScope, toastr, widgetService) {
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

    $scope.$watch('location', function (newVal, oldVal) {
        var onafter = 'onAfterGetWidgets' + $scope.location;
        $scope.$on(onafter, function (event, installedWidgets) {
            $scope.installedWidgets = installedWidgets;
        });

        var onCloseButtonClicked = 'onAfterCloseButtonClicked' + $scope.location;
        $scope.$on(onCloseButtonClicked, function (event, widget) {
            $scope.uninstall(widget._id);
        });
    });

    $scope.isInstalled = function (widgetId) {
        if ($scope.installedWidgets) {
            var isInstalled = _.find($scope.installedWidgets, {widgetId: {_id: widgetId}});
            return isInstalled;
        }

        return false;
    };

    $scope.install = function (location, application, name, extraParams) {

        widgetService.install(location, application, name, extraParams,

            function (installedWidget) {
                $scope.installedWidget = installedWidget;

                // hide the widget gallery
                $('#widgetGallery').modal('hide');
                $('#widgetGalleryAnalytics').modal('hide');
                toastr.success('Widget is installed');

                $rootScope.$broadcast('onAfterInstall' + location, $scope.installedWidget);
            },

            function (errors) {
                toastr.error('Installation failed');
            }
        );
    };

    $scope.uninstall = function (installId) {

        widgetService.uninstall(installId, {},
            function (uninstalled) {
                $scope.uninstalledWidget = uninstalled;

                // hide the widget gallery
                $('#widgetGallery').modal('hide');
                $('#widgetGalleryAnalytics').modal('hide');
                toastr.success('Widget is uninstalled');

                $rootScope.$broadcast('onAfterUninstall' + uninstalled.location, $scope.uninstalledWidget);
            },
            function (errors) {
                toastr.error('Uninstallation failed');
            }
        );
    };

});
