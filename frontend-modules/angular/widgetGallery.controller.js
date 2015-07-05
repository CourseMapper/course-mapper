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
});