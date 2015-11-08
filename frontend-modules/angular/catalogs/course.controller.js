app.controller('CourseController', function($scope, $rootScope, $filter, $http,
                                            $location, $routeParams, $timeout,
                                            courseService, authService, toastr, Page) {
    $scope.course = null;
    $scope.videoSources = false;

    $scope.loc = $location.absUrl() ;
    $scope.courseId = $routeParams.courseId;

    $scope.isOwner = false;
    $scope.isEnrolled = false;

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

        if(q.tab){
            defaultPath = q.tab;
        }

        $scope.currentTab = $scope.tabs[defaultPath];
        $scope.actionBarTemplate = 'actionBar-course-' + $scope.currentTab;

        if($scope.course)
            Page.setTitleWithPrefix($scope.course.name + ' > ' + $scope.currentTab);

        $rootScope.$broadcast('onCourseTabChange', $scope.currentTab);
    };

    $scope.init = function(refreshPicture){
        courseService.init($scope.courseId,
            function(course){
                $scope.course = course;

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
            },

            function(res){
                $scope.errors = res.errors;
                toastr.error('Failed getting course');
            }
        );

        $scope.changeTab();
    };

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
        $scope.loading = true;
        courseService.enroll(authService.user,

            function(){
                $scope.loading = false;
                toastr.success('You are now enrolled');
            },

            function(res){
                $scope.loading = false;
                toastr.error(JSON.stringify(res.errors));
            }
        );

    };

    $scope.leave = function(){
        $scope.loading = true;

        courseService.leave(authService.user,
            function(){
                $scope.loading = false;
                toastr.success('You left the course');
            },

            function(){
                $scope.loading = false;
                toastr.error(JSON.stringify(res.errors));
            }
        );
    };

    /**
     * show new course notification/guide if it is a new course
     */
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

    /**
     * initiate course when user is logged in
     */
    /*authService.loginCheck(function(){
        $scope.init();
    });*/

    $scope.$watch(function(){ return authService.isLoggedIn;}, function(){
        if(authService.isLoggedIn !== null && !$scope.course){
            $scope.init();
        }
    });

    $scope.$watch(function(){ return courseService.isEnrolled(); }, function(newVal, oldVal){
        $scope.isEnrolled = newVal;
    });

    $scope.$watch(function(){ return courseService.isOwner(authService.user); }, function(newVal, oldVal){
        $scope.isOwner = newVal;
    });

    $scope.$on('$routeUpdate', function(){
        $scope.changeTab();
    });
});
