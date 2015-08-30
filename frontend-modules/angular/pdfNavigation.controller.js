app.controller('PDFNavigationController', function($scope, $http, $rootScope, $sce, $timeout) {
    $scope.currentPageNumber = 0;
    $scope.maxPageNumber = 30;
});
