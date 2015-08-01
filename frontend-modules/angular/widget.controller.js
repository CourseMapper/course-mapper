app.controller('widgetController', function($scope, $http, $rootScope, $timeout) {
    $scope.location = "";
    $scope.widgets = [];

    $scope.initWidgetButton = function(id){
        $.AdminLTE.boxWidget.activate();
        $scope.addWidget(id);
    };

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.$watch('location', function(newVal, oldVal){
            if($scope.location == 'user-profile'){
                console.log('onAfterInitUser');
                $scope.getWidgets();
            }
        });
    });

    $scope.$on('onAfterInitCourse', function(event, course){
        console.log('onAfterInitCourse');
        $scope.course = course;
        $scope.getWidgets();
    });

    $scope.$watch('location', function(newVal, oldVal) {
        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('.grid-stack').data('gridstack');
            grid.remove_all();

            $scope.getWidgets();
        });

        var onafter = 'onAfterUninstall' + $scope.location;
        $scope.$on( onafter, function(event, newWidget){
            // remove all widget in the page
            var grid = $('.grid-stack').data('gridstack');
            grid.remove_all();

            $scope.getWidgets();
        });
    });

    $scope.getWidgets = function(){
        var id = "";
        if($scope.location == 'user-profile')
            id = $rootScope.user._id;
        else if($scope.location == 'course-preview' || $scope.location == 'course-analytics')
            id = $scope.course._id;

        $http.get('/api/widgets/' + $scope.location + '/' + id).success(function (data) {
            $scope.widgets = data.widgets;

            $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, $scope.widgets);
        });
    };

    $scope.addWidget = function(id){
        var loc = '#' + $scope.location + '-widgets';
        var grid = $(loc).data('gridstack');

        var el = '#' + id;

        // get width and height
        var i = _.findIndex($scope.widgets, { 'widgetId': {'_id' : id}});
        var wdg = $scope.widgets[i];

        //add_widget(el, x, y, width, height, auto_position)
        grid.add_widget(el, 0, 0, wdg.width, wdg.height, true);
    };

    $scope.closeWidget = function(id){
        var i = _.findIndex($scope.widgets, { 'widgetId': {'_id' : id}});
        var wdg = $scope.widgets[i];

        $rootScope.$broadcast('onAfterCloseButtonClicked' + $scope.location, wdg);
    }
});