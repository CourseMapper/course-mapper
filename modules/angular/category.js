app.controller('CategoryListController', function($scope, $http, $rootScope) {

    $http.get('/api/catalogs/categories').success(function (data) {
        $scope.categories = data;
    });

    $scope.$on('sidebarInit', function (ngRepeatFinishedEvent) {
        $.AdminLTE.tree('.sidebar');
    });

});