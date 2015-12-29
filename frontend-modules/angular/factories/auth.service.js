app.factory('authService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            user: null,

            isCheckingForLogin: false,

            showLoginModal: false,
            /**
             * default value is null  because its used on a watch check
             *
             * if you want to use isLogged, you have to be sure that it already tried to login, or called loginCheck
             * otherwise just use loginCheck
             */
            isLoggedIn: false,
            hasTriedToLogin: false,

            loginCheck: function (successCallback, errorCallback) {
                var self = this;

                if (self.user) {
                    self.isLoggedIn = true;
                    successCallback(self.user);
                }
                else {
                    if (self.isCheckingForLogin)
                        return;

                    self.isCheckingForLogin = true;

                    $http.get('/api/account').success(function (data) {
                        self.isCheckingForLogin = false;

                        self.hasTriedToLogin = true;

                        if (data.result) {
                            self.user = data.user;
                            self.isLoggedIn = true;
                            $rootScope.user = data.user;

                            $rootScope.$broadcast('onAfterInitUser', self.user);
                            successCallback(self.user);
                        }
                    }).error(function (data) {
                        self.isCheckingForLogin = false;
                        self.isLoggedIn = false;
                        self.hasTriedToLogin = true;

                        if (errorCallback)
                            errorCallback(data);
                    });
                }
            },

            isAdmin: function () {
                if (this.user && this.user.role == 'admin')
                    return true;

                return false;
            },

            login: function (loginData, successCallback, errorCallback) {
                var self = this;

                var d = transformRequest(loginData);
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
                            if (data.result) {
                                $rootScope.user = data.user;
                                self.user = data.user;
                                self.isLoggedIn = true;
                                $rootScope.$broadcast('onAfterInitUser', $rootScope.user);
                                successCallback($rootScope.user);
                            }
                        })
                    .error(
                        function (data) {
                            self.isLoggedIn = false;
                            errorCallback(data);
                        });
            },

            signUp: function (loginData, successCallback, errorCallback) {
                var d = transformRequest(loginData);
                $http({
                    method: 'POST',
                    url: '/api/accounts/signUp',
                    data: d,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                    .success(
                        function success(data) {
                            if (data.result) {
                                //$rootScope.user = data.user;
                                $rootScope.$broadcast('onAfterUserRegistration', data.user);

                                successCallback(data.user);
                            } else {
                                errorCallback(data);
                            }
                        }).error(
                    function (data) {
                        errorCallback(data);
                    }
                );
            },

            showLoginForm: function () {
                $('#loginFormModal').modal({backdrop: 'static', keyboard: false});
            }
        }
    }
]);