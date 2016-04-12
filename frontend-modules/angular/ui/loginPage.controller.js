app.controller('LoginPageController', function ($scope, $http, $rootScope, $cookies, authService, toastr, $location) {
    $scope.rememberMe = false;
    $scope.loginData = {};
    $scope.errors = [];
    $scope.user = null;
    $scope.referer = false;
    $scope.isLoading = false;

    authService.loginCheck(function (user) {
        $scope.user = user;
        if ($scope.user) {
            window.location = '/accounts';
        }
    });

    if ($cookies.rememberMe) {
        $scope.rememberMe = $cookies.rememberMe;
    }

    $scope.$watch('rememberMe', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            $cookies.rememberMe = $scope.rememberMe;
        }
    });

    $scope.noticeAfterSignUp = function () {
        var k = $location.search();
        if (k.referer && k.referer == 'signUp' && k.result && k.result == 'success') {
            toastr.success('Please login using your new username and password!', 'Sign Up Success');
        }
    };

    $scope.noticeAfterSignUp();

    $scope.login = function (isValid) {
        if (isValid) {
            $scope.isLoading = true;
            authService.login($scope.loginData,
                function (user) {
                    $scope.user = user;
                    if (!$scope.referer) {
                        window.location = '/accounts';
                    }

                    $scope.isLoading = false;
                },
                function error(data) {
                    if (data.errors) {
                        $scope.errors = data.errors;
                    }
                    $scope.isLoading = false;
                }
            );
        }
    }

});