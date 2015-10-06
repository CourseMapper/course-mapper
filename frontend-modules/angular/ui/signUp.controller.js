app.controller('SignUpController', function($scope, $http, $rootScope, $cookies, authService) {

    $scope.loginData = {};
    $scope.errors = [];
    $scope.isLoading = false;

    authService.loginCheck(function(user){
        if(user){
            window.location = '/accounts';
        }
    });

    $scope.signUp = function(isValid){
        if(isValid){
            $scope.isLoading = true;
            authService.signUp($scope.loginData,
                function(user){
                    $scope.isLoading = false;
                    window.location = '/accounts/login/#?referer=signUp&result=success';
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