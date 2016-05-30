app.controller('widgetCourseAnalyticsController', function ($scope, $http, $rootScope,
                                                            $timeout, toastr,
                                                            widgetService, courseService, authService) {
    $scope.location = "course-analytics";
    $scope.widgets = [];

    $scope.getWidgets = function (force) {
        widgetService.getWidgetsOnLocation($scope.location, $scope.course._id,

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
        widgetService.uninstall(id, {courseId: $scope.course._id},
            function (wdg) {
                var grid = $('#' + $scope.location + '-widgets').data('gridstack');
                grid.removeAll();
                $scope.getWidgets(true);
                toastr.success('Widget is uninstalled');
            },

            function (errors) {
                toastr.error('Uninstallation failed');
            }
        );
    };

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

    $scope.initWidgets = function () {

        if (courseService.course) {
            $scope.course = courseService.course;
            $scope.getWidgets();

        } else {
            $scope.$on('onAfterInitCourse', function (e, course) {
                $scope.course = course;
                $scope.getWidgets();
            });
        }

        var enableDragging = ($scope.isManager || authService.isAdmin() || $scope.isOwner) ? true : false;
        widgetService.initiateDraggableGrid($scope.location, enableDragging);

        $scope.setupInstallmentWatch();
    };

    $scope.initWidgetButton = function (id) {
        widgetService.initWidgetButton($scope.location, id)
    };

    $scope.checkOwnership = function (userId) {
        if (authService.user && authService.user._id == userId)
            return true;

        if ($scope.isManager || authService.isAdmin())
            return true;

        return false;
    };

    $scope.initWidgets();

    $scope.$on('afterAllWidgetsRendered', function () {
        widgetService.initiateDragStop($scope.location);
    });
});
