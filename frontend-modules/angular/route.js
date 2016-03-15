app.config(['$routeProvider', '$locationProvider',

    function ($routeProvider, $locationProvider) {

        $routeProvider.
        when('/static/about', {
            templateUrl: '/static/about',
            controller: 'staticController',
            reloadOnSearch: false
        }).

        when('/category/:slug', {
            templateUrl: function (params) {
                var tUrl = 'courses_list.html';
                var hasQueryStringStart = false;
                if(typeof(params.l2pToken) != 'undefined'){
                    if(!hasQueryStringStart)
                      tUrl += '?';
                    else {
                      tUrl += '&';
                    }
                    tUrl += 'l2pToken=' + params.l2pToken;
                    hasQueryStringStart = true;
                }
                if(typeof(params.l2pCourse) != 'undefined'){
                    if(!hasQueryStringStart)
                      tUrl += '?';
                    else {
                      tUrl += '&';
                    }
                    tUrl += 'l2pCourse=' + params.l2pCourse;
                    hasQueryStringStart = true;
                }
                console.log(tUrl);
                return tUrl;
            },
            controller: 'CourseListController',
            reloadOnSearch: false
        }).

        when('/cid/:courseId/nid/:nodeId', {
            templateUrl: function (params) {
                var tUrl = '/treeNode/' + params.courseId + '/nodeDetail/' + params.nodeId;
                var hasQueryStringStart = false;
                if (params.iframe === 'true' || params.iframe === 'false'){
                  if(!hasQueryStringStart)
                    tUrl += '?';
                  else {
                    tUrl += '&';
                  }
                  tUrl += 'iframe=' + params.iframe;
                  hasQueryStringStart = true;
                }
                if(typeof(params.l2pToken) != 'undefined'){
                    if(!hasQueryStringStart)
                      tUrl += '?';
                    else {
                      tUrl += '&';
                    }
                    tUrl += 'l2pToken=' + params.l2pToken;
                    hasQueryStringStart = true;
                }
                if(typeof(params.l2pCourse) != 'undefined'){
                    if(!hasQueryStringStart)
                      tUrl += '?';
                    else {
                      tUrl += '&';
                    }
                    tUrl += 'l2pCourse=' + params.l2pCourse;
                    hasQueryStringStart = true;
                }
                console.log(tUrl);
                return tUrl;
            },
            controller: 'NodeRootController',
            reloadOnSearch: false
        }).

        when('/cid/:courseId', {
            templateUrl: function (params) {
                var tUrl = '/course/courseDetail/' + params.courseId;
                var hasQueryStringStart = false;
                if (params.iframe === 'true' || params.iframe === 'false'){
                  if(!hasQueryStringStart)
                    tUrl += '?';
                  else {
                    tUrl += '&';
                  }
                  tUrl += 'iframe=' + params.iframe;
                  hasQueryStringStart = true;
                }
                if(typeof(params.l2pToken) != 'undefined'){
                    if(!hasQueryStringStart)
                      tUrl += '?';
                    else {
                      tUrl += '&';
                    }
                    tUrl += 'l2pToken=' + params.l2pToken;
                    hasQueryStringStart = true;
                }
                if(typeof(params.l2pCourse) != 'undefined'){
                    if(!hasQueryStringStart)
                      tUrl += '?';
                    else {
                      tUrl += '&';
                    }
                    tUrl += 'l2pCourse=' + params.l2pCourse;
                    hasQueryStringStart = true;
                }
                console.log(tUrl);
                return tUrl;
            },
            controller: 'CourseRootController',
            reloadOnSearch: false
        }).

        otherwise({
            redirectTo: '/'
        });

    }]);
