externalApp.controller('CreateAppController', function ($scope, $rootScope, $http, $location, $sce,
                                                        $compile, $timeout,
                                                        toastr, Page, $window) {

    $scope.name = "";
    $scope.description = "";

    $scope.saveApp = function (isValid) {
        if (isValid) {
            $scope.isLoading = true;
            var params = {
                name: $scope.name,
                description: $scope.description
            };

            var d = transformRequest(params);
            $http({
                method: 'POST',
                url: '/api/oauth2/apps',
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    console.log(data);
                    if (data.result) {
                        $scope.$emit('onAfterCreateApplication');
                    }

                    $scope.isLoading = false;
                    toastr.success('Application is created.');
                    window.location.href = "/settings/apps/#/app/" + data.app._id;
                })
                .error(function (data) {
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                });
        }
    };
});