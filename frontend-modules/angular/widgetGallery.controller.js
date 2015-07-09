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
        $http.put('/api/widgets/install', {
            application: application,
            widget: name,
            location: location,
            courseId: courseId
        }).success(function (data) {
            if(data.result)
                $scope.installedWidget = data.installed;

            // hide the widget gallery
            $('#widgetGallery').modal('hide');
        });
    }
});