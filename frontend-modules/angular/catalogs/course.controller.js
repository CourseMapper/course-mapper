app.controller('CourseController', function($scope, $rootScope, $filter, $http,
                                            $location, $routeParams, $timeout, toastr, Page) {
    $scope.course = null;
    $scope.videoSources = false;
    $scope.enrolled = false;
    $scope.loc = $location.absUrl() ;
    $scope.courseId = $routeParams.courseId;
    $scope.isOwner = false;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $scope.isPlaying = false;

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

        if(!q.tab){
            q.tab = defaultPath;
        }

        $scope.currentTab = $scope.tabs[q.tab];
        $scope.actionBarTemplate = 'actionBar-course-' + $scope.currentTab;

        if($scope.course)
            Page.setTitleWithPrefix($scope.course.name + ' > ' + $scope.currentTab);

        $rootScope.$broadcast('onCourseTabChange', $scope.currentTab);
    };

    $scope.init = function(refreshPicture){
        $http.get('/api/course/' + $scope.courseId).success(function(res){
            if(res.result) {
                $scope.course = res.course;

                Page.setTitleWithPrefix($scope.course.name);

                if(refreshPicture) {
                    if($scope.course.picture)
                        $scope.course.picture = $scope.course.picture + '?' + new Date().getTime();
                }

                if($scope.course.video){
                    $scope.videoSources = [{
                        src: $scope.course.video,
                        type: 'video/mp4'
                    }];
                }

                if(!refreshPicture) {
                    $timeout(function () {
                        $scope.$broadcast('onAfterInitCourse', $scope.course);
                    });
                }
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

            if ($scope.course.createdBy._id == $rootScope.user._id) {
                $scope.isOwner = true;
                $scope.enrolled = true;
            }
        }
    });

    $scope.playVideo = function(){
        $scope.isPlaying = true;
    };

    $scope.stopVideo = function(){
        $scope.isPlaying = false;
    };

    $scope.$on('onAfterEditCourse',function(events, course){
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
            toastr.success('You are now enrolled');
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
            toastr.success('You left the course');
        });
    };

    $scope.$on('$routeUpdate', function(){
        $scope.changeTab();
    });

    $scope.newCourseNotification = function(){
        var loc = $location.search();
        if(loc.new && loc.new == 1){
            toastr.info('<p>You are now in a newly created course. </p>' +
            '<p>You can start by customizing this course by uploading introduction picture and video on the edit panel.</p>' +
            '<p>Collaborate and Annotate on course map and its contents in <i class="ionicons ion-map"></i> <b>Map Tab</b></p>' +
            '<p>Discuss related topic in <i class="ionicons ion-ios-chatboxes"></i> <b>Discussion Tab.</b></p>' +
            '<p>Adding widgets on <i class="ionicons ion-stats-bars"></i> <b>Analytics tab</b>.</p>' +
            '<p>Or wait for your students to enroll in to this course and start collaborating.</p>'
                , 'New course created'
                , {
                    allowHtml: true,
                    closeButton: true,
                    autoDismiss: false,
                    tapToDismiss: false,
                    toastClass: 'toast wide',
                    extendedTimeOut: 30000,
                    timeOut: 30000
                });
        }

    };

    $scope.newCourseNotification();
});
