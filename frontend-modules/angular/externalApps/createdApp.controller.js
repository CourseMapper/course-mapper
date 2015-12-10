externalApp.controller('CreatedAppController', function ($scope, $rootScope, $http, $location, $sce,
                                                         $compile, $timeout, $routeParams,
                                                         toastr, Page, externalAppService) {

    $scope.app = false;
    $scope.appId = $routeParams.appId;

    externalAppService.getAppDetail($scope.appId, function (app) {
        $scope.app = app;
    }, function (err) {
        $scope.errors = err;
    })
});
