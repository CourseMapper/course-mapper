externalApp.controller('CreatedAppController', function ($scope, $rootScope, $http, $location, $sce,
                                                         $compile, $timeout, $routeParams,
                                                         toastr, Page, externalAppService) {

    $scope.app = false;
    $scope.originalApp = false;
    $scope.appId = $routeParams.appId;

    externalAppService.getAppDetail($scope.appId, function (app) {
        $scope.originalApp = app;
        $scope.app = angular.copy(app);
    }, function (err) {
        $scope.errors = err;
    });

    $scope.editApp = function (isValid) {
        if (!isValid)
            return;

        $scope.isLoading = true;
        var params = {
            name: $scope.app.name,
            description: $scope.app.description,
            callbackUrl: $scope.app.callbackUrl
        };

        var d = transformRequest(params);
        $http({
            method: 'PUT',
            url: '/api/oauth2/app/' + $scope.app._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {
                if (data.result) {
                    $scope.$emit('onAfterEditApplication');
                }

                $scope.isLoading = false;
                toastr.success('Application saved.');
            })
            .error(function (data) {
                $scope.isLoading = false;
                $scope.errors = data.errors;
            });
    };

    $scope.deleteApp = function () {
        if (!window.confirm('Are you sure you want to delete this application?'))
            return;

        $scope.isLoadingDelete = true;

        $http({
            method: 'DELETE',
            url: '/api/oauth2/app/' + $scope.app._id,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {
                if (data.result) {
                    $scope.$emit('onAfterDeleteApplication');
                }

                $scope.isLoadingDelete = false;
                toastr.success('Application Deleted.');
                $location.path('/installed').replace();
            })
            .error(function (data) {
                $scope.isLoadingDelete = false;
                $scope.errors = data.errors;
            });
    };

    $scope.cancel = function () {
        $scope.app = angular.copy($scope.originalApp);
    }
});
