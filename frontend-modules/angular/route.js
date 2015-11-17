app.config(['$routeProvider', '$locationProvider',

    function ($routeProvider, $locationProvider) {

        $routeProvider.
        when('/static/about', {
            templateUrl: '/static/about',
            controller: 'staticController',
            reloadOnSearch: false
        }).

        when('/category/:slug', {
            templateUrl: 'courses_list.html',
            controller: 'CourseListController',
            reloadOnSearch: false
        }).

        when('/cid/:courseId/nid/:nodeId', {
            templateUrl: '/course/nodeDetail',
            controller: 'NodeDetailController',
            reloadOnSearch: false
        }).

        when('/cid/:courseId', {
            templateUrl: function (params) {
                return '/course/courseDetail/' + params.courseId;
            },
            controller: 'CourseRootController',
            reloadOnSearch: false
        }).

        otherwise({
            redirectTo: '/'
        });

    }]);
