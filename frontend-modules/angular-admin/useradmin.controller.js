admin.controller('AdminUserController', function ($scope, $route, $routeParams, authService,
                                                  $location, $http, $timeout, toastr) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.users = null;
    $scope.formData = {};
    $scope.currentUser = null;

    $scope.init = function () {
        $http.get('/api/accounts/all').success(function (res) {
            if (res.result && res.users) {
                $scope.users = res.users;
            }
        });
    };

    $scope.$on('onAfterInitUser', function (event, user) {
        $scope.currentUser = user.user;
    });


    /*$scope.activate = function (tabName) {
     $http.put('/api/tabs/' + tabName, {
     isActive: true
     }).success(function (res) {
     if (res.result && res.tab) {
     res.tab.isActive = true;
     updateTabResult(res.tab, $scope.tabs);
     }
     });
     };

     $scope.deactivate = function (tabName) {
     $http.put('/api/tabs/' + tabName, {
     isActive: false
     })
     .success(function (res) {
     if (res.result && res.tab) {
     res.tab.isActive = false;
     updateTabResult(res.tab, $scope.tabs);
     }
     });
     };*/

    $scope.saveUserForm = function () {
        $scope.formData.role = 'admin';

        $scope.isLoading = true;
        authService.signUp($scope.formData,
            function (user) {
                $scope.isLoading = false;
                toastr.success('User was added.');
                $scope.init();
                $scope.formData.username = '';
                $scope.formData.email = '';
                $scope.formData.password = '';
            },
            function error(data) {
                if (data.errors) {
                    $scope.errors = data.errors;
                }
                $scope.isLoading = false;
            }
        );
    };

    $scope.deleteUser = function (_id) {
        if (confirm("Are you sure you want to delete this user?")) {
            $http.delete('/api/account/' + _id).success(function (res) {
                if (res.result) {
                    $scope.init();
                    $scope.formData.username = '';
                    $scope.formData.email = '';
                    $scope.formData.password = '';
                } else {
                    toastr.error('Failed deleting user.');
                }
            });
        }
    };

    $scope.init();

});