externalApp.factory('externalAppService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            installedApps: null,
            createdApps: null,

            getCreatedApps: function (success, error, force) {
                var self = this;

                if (!force && self.createdApps) {
                    if (success)
                        success(self.createdApps);
                }

                else if (force || !self.createdApps)
                    $http.get('/api/oauth2/apps/created')
                        .success(function (data) {
                            if (data.result && data.apps) {
                                self.createdApps = data.apps;
                                if (success)
                                    success(self.createdApps);
                            }
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },

            getInstalledApps: function (success, error, force) {
                var self = this;

                if (!force && self.installedApps) {
                    if (success)
                        success(self.installedApps);
                }
                else if (force || !self.installedApps)
                    $http.get('/api/oauth2/apps/installed')
                        .success(function (data) {
                            if (data.result && data.apps) {
                                self.installedApps = data.apps;
                                if (success)
                                    success(self.installedApps);
                            }
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },

            getAppDetail: function (appId, success, error) {
                $http.get('/api/oauth2/app/' + appId)
                    .success(function (data) {
                        if (data.result && data.app) {
                            if (success)
                                success(data.app);
                        }
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            deleteInstallation: function (installId, success, error) {
                $http.delete('/api/oauth2/installedApp/' + installId)
                    .success(function (data) {
                        if (data.result) {
                            success(data);
                        }
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            }
        }
    }
]);