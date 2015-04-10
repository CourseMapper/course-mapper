admin.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/categories', {
                templateUrl: '/cm-admin/categories',
                controller: 'adminController'
            }).
            otherwise({
                redirectTo: '/cm-admin'
            });
    }]);


