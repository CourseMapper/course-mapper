app.controller('UserEditController', function($scope, $http, $rootScope, $timeout) {
    $scope.user = {};
    $scope.formData = {};
    $scope.errors = null;

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.user = user;
        $scope.formData.displayName = $scope.user.displayName;
    });

    $scope.saveEditUser = function(){
        if($scope.user.displayName)
            $scope.formData.displayName = $scope.user.displayName;

        if($scope.formData.password ) {
            if ($scope.formData.password != $scope.formData.passwordConfirm) {

            }
        }

        var d = transformRequest($scope.formData);
        $http({
            method: 'PUT',
            url: '/api/accounts/' + $scope.user._id,
            data: d, // pass in data as strings
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                if(data.result) {
                    $scope.$emit('init');
                    $('#editAccountModal').modal('hide');
                }
            })
            .error(function(data){
                if(!data.result){
                    $scope.errors = data.errors;
                    console.log(data.errors);
                }
            });
    };

    $scope.cancel = function(){
        $('#editAccountModal').modal('hide');
    }

});
