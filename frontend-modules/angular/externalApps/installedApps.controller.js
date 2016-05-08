externalApp.controller('InstalledAppsController', function ($scope, $rootScope, $http, $location, $sce,
                                                            $compile, $timeout,
                                                            toastr, externalAppService) {

    $scope.deleteInstallation = function (installId) {
        if (confirm('This application will not have access to your data anymore.')) {
            externalAppService.deleteInstallation(installId,
                function () {
                    toastr.success('Application deleted.');
                    var deleted = _.remove($scope.$parent.installedApps, {clientId: installId});
                },
                function () {
                    toastr.error('Delete failed.');
                }
            );
        }
    }
});