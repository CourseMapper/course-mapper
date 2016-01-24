app.controller('ResetPasswordController', function ($scope, $filter, $http, toastr, Page, $timeout, $routeParams) {
    $scope.submitted = false;
    $scope.isLoading = false;
    $scope.errors = [];
    $scope.loginData = {};

    Page.setTitleWithPrefix('Reset Password');

    if($routeParams.tokenInvalid && $routeParams.tokenInvalid == '1'){
        toastr.error("Token is invalid or expired, please do another request");
    }

    $scope.resetPassword = function (isValid) {
        var url = window.location.href.split('/');
        var token = url[url.length - 1];

        if (isValid) {
            $scope.isLoading = true;
            var d = transformRequest($scope.loginData);
            $http({
                method: 'POST',
                url: '/api/accounts/reset/' + token,
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    if (data.result) {
                        toastr.success('Your password has been reset, Please login with your new password');
                    }

                    $scope.isLoading = false;
                    $scope.loginData = {};

                    $scope.resetForm.$setPristine();

                    $timeout(function () {
                        window.location.href = '/accounts/login';
                    }, 500);
                })
                .error(function (data) {
                    $scope.isLoading = false;
                    if (data.errors) {
                        $scope.errors = data.errors;
                    }
                    toastr.success('Sending Request failed');
                    $scope.loginData = {};

                });
        }
    };

    $scope.requestReset = function (isValid) {
        if (isValid) {

            $scope.isLoading = true;
            var d = transformRequest($scope.loginData);
            $http({
                method: 'POST',
                url: '/api/accounts/resetPassword',
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    if (data.result) {
                        toastr.success('Reset Password Requested, Please check your email');
                    }

                    $scope.isLoading = false;
                    $scope.loginData = {};

                    $scope.resetForm.$setPristine();
                })
                .error(function (data) {
                    $scope.isLoading = false;
                    if (data.errors) {
                        $scope.errors = data.errors;
                    }

                    toastr.error('Sending Request failed');
                    $scope.loginData = {};

                });
        }
    };
});
