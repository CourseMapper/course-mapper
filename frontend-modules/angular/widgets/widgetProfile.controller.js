app.controller('profileWidgetController', function ($scope, $http, $rootScope, $ocLazyLoad, $timeout, widgetService, toastr) {
    $scope.location = "user-profile";
    $scope.widgets = [];
    $scope.widgetsTemp = [];
    $scope.dragInitiated = false;

    $scope.initWidgetButton = function (id) {
        widgetService.initWidgetButton($scope.location, id)
    };

    $scope.initWidgets = function () {
        $scope.getWidgets();
        widgetService.initiateDraggableGrid($scope.location, true);
        $scope.setupInstallmentWatch();
    };

    $scope.$on('onAfterInitUser', function (event, user) {
        $scope.initWidgets(true);
    });

    $scope.setupInstallmentWatch = function () {
        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.removeAll();

            $scope.getWidgets(true);
        });

        var onafter2 = 'onAfterUninstall' + $scope.location;
        $scope.$on(onafter2, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.removeAll();

            $scope.getWidgets(true);
        });
    };

    $scope.getWidgets = function (force) {
        widgetService.getWidgetsOnLocation($scope.location, $rootScope.user._id,

            function (widgets) {
                $scope.widgets = widgets;
                $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, widgets);
            },

            function (errors) {
                toastr.error(errors);
            },

            force
        );
    };

    $scope.closeWidget = function (id) {

        widgetService.uninstall(id, {},
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

    $scope.$on('afterAllWidgetsRendered', function () {
        if(!$scope.dragInitiated)
            widgetService.initiateDragStop($scope.location);

        $scope.dragInitiated = true;
    });

});
