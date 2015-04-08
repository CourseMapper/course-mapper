app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/about', {
                templateUrl: '/static/about',
                controller: 'staticController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);


