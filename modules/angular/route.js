app.config(['$routeProvider', /*'$locationProvider',*/

    function($routeProvider/*, $locationProvider*/) {

        $routeProvider.
            when('/about', {
                templateUrl: '/static/about',
                controller: 'staticController'
            }).
            otherwise({
                redirectTo: '/'
            });

        /*$locationProvider.html5Mode(true);*/

    }]);


