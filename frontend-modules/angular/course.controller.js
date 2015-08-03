app.controller('CourseController', function($scope, $rootScope, $filter, $http, $location, $routeParams, $timeout) {
    $scope.course = null;
    $scope.enrolled = false;
    $scope.loc = $location.absUrl() ;
    $scope.courseId = $routeParams.courseId;
    $scope.isOwner = false;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $scope.currentTab = "preview";
    $scope.tabs = {
        'preview':'preview',
        'analytics':'analytics',
        'map':'map',
        'updates':'updates',
        'discussion':'discussion'
    };

    $scope.changeTab = function(){
        var defaultPath = "preview";
        var q = $location.search();

        if(q.tab){
            defaultPath = q.tab;
        }

        $scope.currentTab = $scope.tabs[defaultPath];
        $scope.actionBarTemplate = 'actionBar-course-' + $scope.currentTab;
    };

    $scope.init = function(refreshPicture){
        $http.get('/api/course/' + $scope.courseId).success(function(res){
            if(res.result) {
                $scope.course = res.course;

                if(refreshPicture && $scope.course.picture)
                    $scope.course.picture = $scope.course.picture + '?' + new Date().getTime();

                $timeout(function(){
                    $scope.$broadcast('onAfterInitCourse', $scope.course);
                });
            }
        });

        $scope.changeTab();
    };

    $scope.init();

    $scope.$watchGroup(['user', 'course'], function(){
        if($scope.user != null && $scope.course != null) {
            $http.get('/api/accounts/' + $rootScope.user._id + '/course/' + $scope.courseId).success(function (res) {
                if (res.result && res.courses) {
                    $scope.enrolled = res.courses.isEnrolled;
                } else {
                    $scope.enrolled = false;
                }
            });

            if ($scope.course.createdBy == $rootScope.user._id) {
                $scope.isOwner = true;
                $scope.enrolled = true;
            }
        }
    });

    $scope.$on('onAfterEditCourse',function(events, course){
        //$scope.course = course;
        $scope.init(true);
    });

    $scope.enroll = function(){
        var url = '/api/course/' + $scope.course._id + '/enroll';
        $scope.loading = true;
        $http.put(url, {}).success(function(res){
            if(res.result)
                $scope.enrolled = true;

        }).finally(function(){
            $scope.loading = false;
        });
    };

    $scope.leave = function(){
        var url = '/api/course/' + $scope.course._id + '/leave';
        $scope.loading = true;
        $http.put(url, {}).success(function(res){
            if(res.result){
                // success leaving
                $scope.enrolled = false;
            }
        }).finally(function(){
            $scope.loading = false;
        });
    };

    $scope.$on('$routeUpdate', function(){
        $scope.changeTab();
    });
});