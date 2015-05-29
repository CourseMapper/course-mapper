app.config(['$routeProvider', '$locationProvider',

    function($routeProvider, $locationProvider) {

        $routeProvider.
            when('/static/about', {
                templateUrl: '/static/about',
                controller: 'staticController'
            }).

            when('/category/:slug', {
                templateUrl: 'courses_list.html',
                controller: 'CourseListController'
            }).

            otherwise({
                redirectTo: '/'
            });

        /*$locationProvider.html5Mode({enabled: true,
            requireBase: false});*/

    }]);

