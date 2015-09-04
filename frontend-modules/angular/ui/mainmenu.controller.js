app.controller('MainMenuController', function($scope, $http, $rootScope, $cookies) {
    $scope.rememberMe = false;
    $scope.loginData = {};
    $scope.errors = [];

    $http.get('/api/accounts').success(function(data) {
        if(data.result) {
            $scope.user = data.user;
            $rootScope.user = data.user;

            $rootScope.$broadcast('onAfterInitUser', $rootScope.user);
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
            $scope.loginData.rememberMe = $scope.rememberMe;
            var d = transformRequest($scope.loginData);
            $http({
                method: 'POST',
                url: '/api/accounts/login',
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(
                function success(data) {
                    if(data.result) {
                        $scope.user = data.user;
                        $rootScope.user = data.user;

                        $rootScope.$broadcast('onAfterInitUser', $rootScope.user);

                        window.location = '/accounts';
                    }
                }).error(
                function error(data) {
                    if(data.errors){
                        $scope.errors = data.errors;
                    }
                }
            );
        }
    }

});