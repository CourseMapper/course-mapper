externalApp.config(['$routeProvider', '$locationProvider',

    function ($routeProvider, $locationProvider) {

        $routeProvider.
        when('/createExternalApp', {
            templateUrl: '/settings/apps/createExternalApp',
            controller: 'CreateAppController',
            reloadOnSearch: false
        }).

        when('/createdApps', {
            templateUrl: '/settings/apps/createdApps',
            controller: 'CreatedAppsController',
            reloadOnSearch: false
        }).

        when('/installed', {
            templateUrl: '/settings/apps/installed',
            controller: 'InstalledAppsController',
            reloadOnSearch: false
        }).

        when('/documentation', {
            templateUrl: '/settings/apps/documentation',
            controller: 'CreatedAppsController',
            reloadOnSearch: false
        }).

        when('/app/:appId', {
            templateUrl: '/settings/apps/appDetail',
            controller: 'CreatedAppController',
            reloadOnSearch: false
        }).

        otherwise({
            redirectTo: '/'
        });

    }]);
