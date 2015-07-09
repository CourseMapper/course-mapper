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

    $scope.getWidgets = function(){
        $http.get('/api/widgets/' + $scope.location + '/' + $scope.course._id).success(function (data) {
            $scope.widgets = data.widgets;
        });
    };

    $scope.getEntryPoint = function(entry){
        return entry;
    };

    $scope.addWidget = function(id){
        var grid = $('.grid-stack').data('gridstack');
        var el = '#' + id;
        grid.add_widget(el, 0, 0, 12, 1, true);
    };
});