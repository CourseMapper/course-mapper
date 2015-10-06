app.controller('SignUpController', function($scope, $http, $rootScope, $cookies, authService) {
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

    $scope.signUp = function(isValid){
        if(isValid){
            $scope.isLoading = true;
            authService.signUp($scope.loginData,
                function(){
                    $scope.isLoading = false;
                    window.location = '/accounts/login/#?referer=signUp';
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