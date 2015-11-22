app.controller('PdfTabController', function ($scope, $rootScope, $filter, $http, $location,
                                             $routeParams, $timeout, ActionBarService) {

    $scope.init = function () {
        if ($scope.currentPdfPage > 1) {
            var slidePage = $location.search().slidePage;
            if (!slidePage || (slidePage && slidePage == 1)) {
                $location.search('slidePage', $scope.currentPdfPage).replace();
            }
        }
    };

    $scope.init();
});
