app.config(['$routeProvider', '$locationProvider',

    function($routeProvider, $locationProvider) {

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

            when('/cid/:courseId', {
                templateUrl: '/course/courseDetail',
                controller: 'CourseController',
                reloadOnSearch: false
            }).

            when('/cid/:courseId/nid/:nodeId', {
                templateUrl: '/course/nodeDetail',
                controller: 'NodeDetailController',
                reloadOnSearch: false
            }).

            // we dont need it here, because you are not using
            // '#' (hash tag in the url). please refer to "angular route" in google for this.
            // in the way you are doing now, you can just use the express routing system.
            // the file you have to take care is /routes/slide-viewer/slideViewer.js
            /*when('/slide-viewer', {
                templateUrl: 'slideViewer.html',
                controller: 'CommentListController',
                reloadOnSearch: false
            }).*/

            otherwise({
                redirectTo: '/'
            });

    }]);
