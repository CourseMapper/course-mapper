app.controller('LoginPageController', function($scope, $http, $rootScope, $cookies, authService) {
    $scope.rememberMe = false;
    $scope.loginData = {};
    $scope.errors = [];
    $scope.user = null;
    $scope.referer = false;
    $scope.isLoading = false;

    authService.loginCheck(function(user){
        $scope.user = user;
        if($scope.user){
            window.location = '/accounts';
        }
    });

    if($cookies.rememberMe) {
        $scope.rememberMe = $cookies.rememberMe;
    }

    $scope.$watch('rememberMe', function(newVal, oldVal){
        if(newVal !== oldVal){
            $cookies.rememberMe = $scope.rememberMe;
        }
    });

    $scope.login = function(isValid){
        if(isValid){
            $scope.isLoading = true;
            authService.login($scope.loginData,
                function(user){
                    $scope.user = user;
                    if(!$scope.referer) {
                        window.location = '/accounts';
                    }
                    $scope.isLoading = false;
                },
                function error(data) {
                    if(data.errors){
                        $scope.errors = data.errors;
                    }
                    $scope.isLoading = false;
                }
            );
        }
    }

});