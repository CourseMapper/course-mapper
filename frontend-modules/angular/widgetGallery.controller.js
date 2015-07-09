app.controller('WidgetGalleryController', function ($scope, $http, $rootScope) {
    $scope.location = "";
    /**
     * get widgets store data from the server
     */
    $scope.initData = function (location) {
        $scope.location = location;

        $http.get('/api/widgets/' + location).success(function (data) {
            $scope.widgets = data.widgets;
        });
    };

    $scope.install = function(location, application, name, courseId){
        var params = {
            application: application,
            widget: name,
            location: location
        };

        if(courseId)
            params.courseId = courseId;

        $http.put('/api/widgets/install', params).success(function (data) {
            if(data.result)
                $scope.installedWidget = data.installed;

            // hide the widget gallery
            $('#widgetGallery').modal('hide');

            // remove all widget in the page
            var grid = $('.grid-stack').data('gridstack');
            grid.remove_all();

            $rootScope.$broadcast('onAfterInstall', $scope.installedWidget);
        });
    }
});