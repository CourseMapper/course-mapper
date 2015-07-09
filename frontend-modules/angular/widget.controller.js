app.controller('widgetController', function($scope, $http, $rootScope) {
    $scope.location = "";

    $scope.initWidgetButton = function(id){
        $.AdminLTE.boxWidget.activate();
        $scope.addWidget(id);
    };

    $scope.$on('onAfterInitCourse', function(event, course){
        $scope.course = course;
        $scope.getWidgets();
    });

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.$watch('location', function(newVal, oldVal){
            if($scope.location == 'user-profile'){
                $scope.getWidgets();
            }
        });
    });

    $scope.$on('onAfterInstall', function(event, newWidget){
        $scope.getWidgets();
    });

    $scope.getWidgets = function(){
        var id = "";
        if($scope.location == 'user-profile')
            id = $rootScope.user._id;
        else if($scope.location == 'course-preview' || $scope.location == 'course-analytics')
            id = $scope.course._id;

        $http.get('/api/widgets/' + $scope.location + '/' + id).success(function (data) {
            $scope.widgets = data.widgets;
        });
    };

    $scope.addWidget = function(id){
        var grid = $('.grid-stack').data('gridstack');
        var el = '#' + id;

        // get width and height
        var i = _.findIndex($scope.widgets, { 'widgetId': {'_id' : id}});
        var wdg = $scope.widgets[i];

        //add_widget(el, x, y, width, height, auto_position)
        grid.add_widget(el, 0, 0, wdg.width, wdg.height, true);
    };
});