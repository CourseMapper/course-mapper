externalApp.controller('ExternalAppsController', function ($scope, $rootScope, $http, $location, $sce,
                                                           $compile, ActionBarService, courseService,
                                                           discussionService, $timeout,
                                                           toastr, Page, $window, externalAppService) {
    $scope.createdApps = [];
    $scope.installedApps = [];
    $scope.errors = [];

    externalAppService.getCreatedApps(
        function (apps) {
            $scope.createdApps = apps;
        },
        function (err) {
            $scope.errors = err;
        }
    );

    externalAppService.getInstalledApps(
        function (apps) {
            $scope.installedApps = apps;
        },
        function (err) {
            $scope.errors = err;
        }
    );

    $scope.isEmptyObject = function(obj) {
        for(var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }

});