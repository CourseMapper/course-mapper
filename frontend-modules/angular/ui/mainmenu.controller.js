app.controller('MainMenuController', function ($scope, $http, $rootScope, $cookies, authService, toastr) {
    $scope.rememberMe = false;
    $scope.loginData = {};
    $scope.errors = [];
    $scope.user = null;
    $scope.referer = false;
    $scope.isLoading = false;

    authService.loginCheck(function (user) {
        $scope.user = user;
    });

    if ($cookies.rememberMe) {
        $scope.rememberMe = $cookies.rememberMe;
    }

    $scope.$watch('rememberMe', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $cookies.rememberMe = $scope.rememberMe;
        }
    });

    $scope.login = function (isValid) {
        if (isValid) {
            $scope.isLoading = true;
            authService.login($scope.loginData,
                function (user) {
                    $scope.user = user;
                    toastr.success('', "You're now logged in!");
                    $scope.isLoading = false;

                    window.location.reload();
                },
                function error(data) {
                    if (data.errors) {
                        $scope.errors = data.errors;
                        $scope.isLoading = false;
                    }
                }
            );
        }
    }

});