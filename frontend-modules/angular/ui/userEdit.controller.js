app.controller('UserEditController', function ($scope, $http, $rootScope, $timeout, authService, toastr) {
    $scope.user = {};
    $scope.formData = {};
    $scope.errors = null;

    $scope.$on('onAfterInitUser', function (event, user) {
        $scope.user = user;
        $scope.formData.displayName = $scope.user.displayName;
    });

    $scope.saveEditUser = function () {
        if ($scope.user.displayName)
            $scope.formData.displayName = $scope.user.displayName;

        if ($scope.formData.password) {
            if ($scope.formData.password != $scope.formData.passwordConfirm) {
                $scope.errors = ['Password and password confirmation does not match.'];
                return;
            }
        }

        var d = transformRequest($scope.formData);
        $http({
            method: 'PUT',
            url: '/api/account/' + $scope.user._id,
            data: d, // pass in data as strings
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {
                if (data.result) {
                    $scope.$emit('init');
                    authService.loginCheck(function (user) {
                        $scope.user = user;
                        $timeout(function () {
                            $scope.$apply();
                            $('.user-image').attr('src', $scope.user.image);
                        });
                    });

                    $scope.formData.password = '';
                    $scope.formData.passwordConfirm = '';
                    $scope.formData.oldPassword = '';

                    toastr.success('Your profile is updated');

                    $('#editAccountModal').modal('hide');
                }
            })
            .error(function (data) {
                if (!data.result) {
                    $scope.errors = data.errors;
                }
            });
    };

    $scope.cancel = function () {
        $('#editAccountModal').modal('hide');
    }

});
