app.controller('widgetCoursePreviewController', function($scope, $http, $rootScope,
                                                         $timeout,
                                                         widgetService, courseService, authService) {
    $scope.location = "course-preview";
    $scope.widgets = [];

    $scope.getWidgets = function(force){
        widgetService.getWidgetsOnLocation($scope.location, $scope.course._id,

            function(widgets){
                $scope.widgets = widgets;
                $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, widgets);
            },

            function(errors){
                toastr.error(errors);
            },

            force
        );
    };

    $scope.closeWidget = function(id){
        widgetService.uninstall(id);
    };

    $scope.setupInstallmentWatch = function(){
        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });

        var onafter2 = 'onAfterUninstall' + $scope.location;
        $scope.$on( onafter2, function(event, newWidget){
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });
    };

    $scope.initWidgets = function(){

        if (courseService.course) {
            $scope.course = course;
            $scope.getWidgets();

        } else {
            $scope.$on('onAfterInitCourse', function (e, course) {
                $scope.course = course;
                $scope.getWidgets();
            });
        }

        /*$scope.$on('onAfterInitUser', function(event, user){
            $scope.$watch('location', function(newVal, oldVal){
                if($scope.location == 'user-profile'){
                    $scope.getWidgets();
                }
            });
        });*/

        widgetService.initiateDraggableGrid($scope.location);
        $scope.setupInstallmentWatch();
    };

    $scope.initWidgetButton = function(id) {
        widgetService.initWidgetButton('course-preview', id)
    };

    $scope.checkOwnership = function(userId){
        if(authService.user && authService.user._id == userId)
            return true;

        return false;
    };

    $scope.initWidgets();
});
