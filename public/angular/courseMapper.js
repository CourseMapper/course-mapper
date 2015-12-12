var app = angular.module('courseMapper', [
    'ngResource', 'ngRoute', 'ngCookies',
    'ngTagsInput', 'ngFileUpload', 'oc.lazyLoad',
    'relativeDate', 'wysiwyg.module', 'angular-quill',
    'VideoAnnotations','SlideViewerAnnotationZones',
    'ngAnimate', 'toastr']);

app.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        positionClass: 'toast-top-center'
    });
});
;app.config(['$routeProvider', '$locationProvider',

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
            templateUrl: function (params) {
                return '/treeNode/' + params.courseId + '/nodeDetail/' + params.nodeId;
            },
            controller: 'NodeRootController',
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
;app.controller('VideoContentPreviewController', function($scope) {
    $scope.API = null;

    $scope.onPlayerReady = function (API) {
        $scope.API = API;
    };

    $scope.$watch('isPlaying', function(newVal, oldVal){
        if(!$scope.isPlaying && $scope.API){
            $scope.API.pause();
        }
    });

});;app.controller('actionBarCoursePreviewController', function ($scope, courseService, authService, toastr) {

    $scope.loading = false;

    $scope.enroll = function () {
        $scope.loading = true;
        courseService.enroll(authService.user,

            function () {
                $scope.loading = false;
                toastr.success('You are now enrolled');
            },

            function (res) {
                $scope.loading = false;
                toastr.error(JSON.stringify(res.errors));
            }
        );

    };

    $scope.leave = function () {
        $scope.loading = true;

        courseService.leave(authService.user,
            function () {
                $scope.loading = false;
                toastr.success('You left the course');
            },

            function () {
                $scope.loading = false;
                toastr.error(JSON.stringify(res.errors));
            }
        );
    };
});
;app.controller('CategoryListController', function($scope, $http, $rootScope) {

    $http.get('/api/categories').success(function (data) {
        $scope.categories = data.categories;
    });

    $scope.$on('sidebarInit', function (ngRepeatFinishedEvent) {
        $.AdminLTE.tree('.sidebar');
    });

});
;app.controller('CourseController', function ($scope, $rootScope, $filter, $http,
                                             $location, $routeParams, $timeout,
                                             courseService, authService, toastr, Page) {

    $scope.courseId = $routeParams.courseId;
    $scope.course = null;
    $scope.videoSources = false;
    $scope.isPlaying = false;

    $scope.tabOpened = function () {
        if (courseService.course) {
            $scope.course = courseService.course;
            $scope.initTab($scope.course);
        } else {
            $scope.$on('onAfterInitCourse', function (event, course, refreshPicture) {
                $scope.initTab(course, refreshPicture);
            });
        }

        $rootScope.$broadcast('onCoursePreviewTabOpened', $scope.currentTab);
    };

    $scope.initTab = function (course, refreshPicture) {
        $scope.course = course;

        if (refreshPicture) {
            if ($scope.course.picture)
                $scope.course.picture = $scope.course.picture + '?' + new Date().getTime();
        }

        if ($scope.course.video) {
            $scope.videoSources = [{
                src: $scope.course.video,
                type: 'video/mp4'
            }];
        }

        Page.setTitleWithPrefix($scope.course.name + ' > Preview');
    };

    $scope.playVideo = function () {
        $scope.isPlaying = true;
    };

    $scope.stopVideo = function () {
        $scope.isPlaying = false;
    };

    /**
     * init tabs
     */
    $scope.tabOpened();
});
;app.controller('CourseConfigController', function ($scope, $http, toastr, $window) {
    $scope.courseEdit = null;
    $scope.errors = [];
    $scope.managersRaw = [];
    $scope.managersIdRaw = [];
    $scope.username = '';
    $scope.isLoading = false;
    $scope.tabsActive = {};
    $scope.settings = {
        disableControls: false,
        disableTop: false
    };

    $scope.$on('onAfterInitCourse', function (event, course) {
        $scope.init(course);
    });

    $scope.init = function (course) {
        if (!course)
            return;

        $scope.managersRaw = [];

        $('#usernameSearchBox').on('keydown', function (event) {
            var x = event.which;
            if (x === 13) {
                event.preventDefault();
                $scope.findUsername();
            }
        });

        $scope.courseEdit = cloneSimpleObject(course);

        $('#managerTagForm input').attr('readonly', 'readonly');

        if ($scope.courseEdit) {
            if ($scope.courseEdit.managers && $scope.courseEdit.managers.length > 0) {
                for (var i in $scope.courseEdit.managers) {
                    var t = $scope.courseEdit.managers[i];
                    $scope.managersRaw.push({"text": t.username, "_id": t._id});
                }
            }
        }
    };

    $scope.findUsername = function () {
        $scope.errors = [];

        if ($scope.username.trim() != '') {
            $scope.isLoading = true;
            $http.get('/api/course/' + $scope.courseEdit._id + '/checkUsername/' + $scope.username)
                .success(function (res) {
                    if (res.result) {
                        if (res.user.username == $scope.username) {
                            if (!_.find($scope.managersRaw, {'text': $scope.username}, 'text')) {
                                $scope.managersRaw.push({"text": res.user.username, '_id': res.user._id});
                            }
                        }
                    }

                    $scope.username = '';
                    $scope.isLoading = false;
                })
                .error(function (res) {
                    $scope.errors = res.errors;
                    $scope.isLoading = false;
                });
        }
    };

    $scope.saveCourseSetting = function (isValid) {
        if (!isValid)
            return;

        $scope.managersIdRaw = [];

        var url = '/api/course/' + $scope.courseEdit._id + '/settings';
        $scope.managersIdRaw = [];
        if ($scope.managersRaw.length > 0) {
            for (var i in $scope.managersRaw) {
                $scope.managersIdRaw.push($scope.managersRaw[i]._id);
            }
        }

        var params = {
            managers: JSON.stringify($scope.managersIdRaw)
        };

        if($scope.tabsActive){
            params.tabsActive = $scope.tabsActive;
        }
        if($scope.settings){
            params.settings = $scope.settings;
        }

        $scope.isLoading = true;
        $http.put(url, params)
            .success(function (res) {
                if (res.result) {
                    toastr.success('Successfully Saved');
                }

                $scope.managersIdRaw = [];

                $scope.isLoading = false;
                $('#configView').modal('hide');
                $scope.errors = [];

                $window.location.reload();
            })
            .error(function (res) {
                $scope.errors = res.errors;
                $scope.isLoading = false;
            });
    };

    $scope.removeUsername = function ($tag) {
        console.log('removed ' + JSON.stringify($tag));
    };

    $scope.cancel = function () {
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);
    };
});
;app.controller('CourseEditController', function ($scope, $filter, $http, $location, Upload, toastr) {
    $scope.createdDate = new Date();
    $scope.courseEdit = null;
    $scope.tagsRaw = [];
    $scope.files = [];
    $scope.filespicture = [];
    $scope.filesvideo = [];

    $scope.isLoading = false;
    $scope.errors = [];

    $scope.progressPercentage = 0;

    $scope.$on('onAfterInitCourse', function (event, course) {
        $scope.init(course);
    });

    $scope.init = function (course) {
        if (!course)
            return;

        $scope.tagsRaw = [];

        $scope.courseEdit = cloneSimpleObject(course);

        if ($scope.courseEdit)
            if ($scope.courseEdit.courseTags && $scope.courseEdit.courseTags.length > 0) {
                for (var i in $scope.courseEdit.courseTags) {
                    var t = $scope.courseEdit.courseTags[i];
                    $scope.tagsRaw.push({"text": t.name});
                }
            }
    };

    $scope.saveCourse = function () {
        if ($scope.tagsRaw) {
            $scope.courseEdit.tags = JSON.stringify($scope.tagsRaw);
        }

        var uploadParams = {
            url: '/api/course/' + $scope.courseEdit._id,
            fields: {
                name: $scope.courseEdit.name,
                description: $scope.courseEdit.description,
                tags: $scope.courseEdit.tags
            }
        };

        uploadParams.file = [];
        // we only take one picture file
        if ($scope.filespicture && $scope.filespicture.length) {
            uploadParams.file.push($scope.filespicture[0]);
        }
        // we only take one vid file
        if ($scope.filesvideo && $scope.filesvideo.length) {
            uploadParams.file.push($scope.filesvideo[0]);
        }

        $scope.isLoading = true;
        $scope.upload = Upload.upload(
            uploadParams
            )
            .progress(function (evt) {
                if (!evt.config.file)
                    return;

                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            })

            .success(function (data) {
                $scope.$emit('onAfterEditCourse', data.course);

                $scope.filespicture = [];
                $scope.filesvideo = [];

                $scope.isLoading = false;
                $('#editView').modal('hide');

                $scope.progressPercentage = 0;

                window.location.reload();
            })

            .error(function (data) {
                $scope.isLoading = false;
                $scope.errors = data.errors;

                $scope.progressPercentage = 0;
            });
    };

    $scope.deleteVideo = function () {
        $http.post('/api/course/' + $scope.courseEdit._id, {
                video: "delete",
                name: $scope.courseEdit.name
            })
            .success(function (data) {
                $scope.courseEdit.video = false;
                $scope.$emit('onAfterEditCourse', data.course);
                toastr.success('Video deleted');
            })
            .error(function () {
                toastr.error('Video delete failed');
            });
    };

    $scope.deletePicture = function () {
        $http.post('/api/course/' + $scope.courseEdit._id, {
                picture: "delete",
                name: $scope.courseEdit.name
            })
            .success(function (data) {
                $scope.courseEdit.video = false;
                $scope.$emit('onAfterEditCourse', data.course);
                toastr.success('Picture deleted');
            })
            .error(function () {
                toastr.error('Picture delete failed');
            });
    };

    $scope.cancel = function () {
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);

        if ($scope.upload) {
            $scope.upload.abort();
        }
    };
});
;
app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.submitted = false;
    $scope.isLoading = false;
    $scope.errors = [];

    $scope.course = {
        name: null,
        category: null,
        description: ''
    };

    $scope.tagsRaw = null;
    $scope.errors = [];

    $scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category._id + '/courseTags?query=' + query);
    };

    $scope.saveCourse = function(isValid) {
        if (isValid) {

            if ($scope.tagsRaw) {
                $scope.course.tags = JSON.stringify($scope.tagsRaw);
            }

            $scope.course.category = $scope.$parent.category._id;

            $scope.isLoading = true;
            var d = transformRequest($scope.course);
            $http({
                method: 'POST',
                url: '/api/courses',
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    console.log(data);
                    if (data.result) {
                        $scope.$emit('onAfterCreateNewCourse');
                        window.location.href = '/course/' + data.course.slug + '/#/cid/' + data.course._id + '?new=1';
                    }

                    $scope.isLoading = false;
                })
                .error(function(data){
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                });
        }
    };
});
;app.controller('CourseRootController', function ($scope, $rootScope, $filter, $http,
                                                 $location, $routeParams, $timeout,
                                                 courseService, authService, toastr, Page) {

    $scope.courseId = $routeParams.courseId;
    $scope.course = null;

    $scope.isOwner = false;
    $scope.isEnrolled = false;
    $scope.isManager = false;
    $scope.isAdmin = false;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $scope.currentTab = "preview";
    $scope.tabDisplayName = "preview";
    $scope.include = null;
    $scope.includeActionBar = null;

    $scope.changeTab = function () {
        var defaultPath = "preview";
        var q = $location.search();

        if (!q.tab) {
            q.tab = defaultPath;
        }

        $scope.currentTab = q.tab;

        $timeout(function () {
            if (!authService.isLoggedIn) {
                if ($scope.currentTab != defaultPath)
                    $location.search('tab', defaultPath);
            }
        });

        if ($scope.course)
            Page.setTitleWithPrefix($scope.course.name + ' > ' + q.tab);

        $scope.include = '/course/tab/' + $scope.currentTab;
        $scope.includeActionBar = '/course/actionBar/' + $scope.currentTab;

        $scope.getTabDisplayName($scope.currentTab);

        $rootScope.$broadcast('onCourseTabChange', $scope.currentTab);
    };

    $scope.getTabDisplayName = function (name) {
        $scope.tabDisplayName = $('li.' + name).attr('data-displayName');
    };

    $scope.init = function (refreshPicture) {
        courseService.init(
            $scope.courseId,

            function (course) {
                $scope.course = course;
                Page.setTitleWithPrefix($scope.course.name);

                $scope.setCapabilities();

                $rootScope.$broadcast('onAfterInitCourse', $scope.course, refreshPicture);
            },

            function (res) {
                $scope.errors = res.errors;
                toastr.error('Failed getting course');
            },

            true
        );

        $scope.changeTab();
    };

    /**
     * show new course notification/guide if it is a new course
     */
    $scope.newCourseNotification = function () {
        var loc = $location.search();
        if (loc.new && loc.new == 1) {
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

    /**
     * initiate course when user hast tried to log in
     */
    $scope.$watch(function () {
        return authService.isLoggedIn;
    }, function () {
        if (authService.hasTriedToLogin && !$scope.course) {
            $scope.init();
        }
    });

    $scope.setCapabilities = function () {
        $scope.isEnrolled = courseService.isEnrolled();
        $scope.isManager = courseService.isManager(authService.user);
        $scope.isAdmin = authService.isAdmin();
        if(authService.user)
            $scope.isOwner = authService.user._id == $scope.course.createdBy._id;
        else
            $scope.isOwner = false;
    };

    $scope.$on('$routeUpdate', function () {
        $scope.changeTab();
    });

    $scope.$on('onAfterEditCourse', function (events, course) {
        $scope.init(true);
    });

    $scope.newCourseNotification();
});
;app.controller('CourseListController', function($scope, $rootScope, $http, $routeParams, $location, $sce, Page ) {
    $scope.slug = $routeParams.slug;

    // chosen filter
    $scope.filterTags = [];
    $scope.filterTagsText = [];
    // this will be displayed on the available filter
    $scope.availableTags = [];
    // the original list
    $scope.courseTags = [];
    $scope.category = null;
    $scope.courses = null;

    $scope.widgets = [];

    $scope.getCoursesFromThisCategory = function(){
        var url = '/api/category/' + $scope.category._id + '/courses';
        var t = [];
        if($scope.filterTags.length > 0) {
            for (var i in $scope.filterTags)
                t.push($scope.filterTags[i]._id);

            url += '?tags=' + t.join(',');
        }

        $http.get(url).success(function(data) {
            $scope.courses = data.courses;
        });
    };

    $scope.initTagFromSearch = function(){
        var tagSearch = $location.search();
        if(tagSearch && tagSearch.tags){
            var tags = tagSearch.tags.split(',');
            if(tags)
                for(var i in tags){
                    var tag = tags[i];
                    if($scope.availableTags)
                        for(var j in $scope.availableTags) {
                            var t = $scope.availableTags[j];
                            if (t.slug == tag)
                                $scope.applyFilter(t, true);
                        }
                }
        }

        $scope.getCoursesFromThisCategory();

        $scope.$watch(function(){ return $location.search() }, function(newVal, oldVal){
            if(newVal && newVal !== oldVal)
                $scope.getCoursesFromThisCategory();
        }, true);
    };

    $scope.getCourseAnalytics = function(cid){
        $http.get('/api/server-widgets/course-listing/?cid=' + cid).success(
            function(res){
                if(res.result){
                    $scope.widgets[cid] = $sce.trustAsHtml(res.widgets);
                }
            }
        ).error(function(){

        });
    };

    $scope.applyFilter = function(tag, dontgo){
        if(arrayObjectIndexOf($scope.filterTags, tag, 'name') < 0){
            $scope.filterTags.push(tag);
            $scope.filterTagsText.push(tag.slug);
            removeObjectFromArray($scope.availableTags, tag, 'name');
            if(!dontgo)
                $scope.go();
        }
    };

    $scope.go = function(){
        if($scope.filterTags.length > 0)
            $location.search({tags: $scope.filterTagsText.join(',')} );
        else
            $location.search({});
    };

    $scope.removeFilter = function(tag){
        if(arrayObjectIndexOf($scope.availableTags, tag, 'name') < 0){
            $scope.availableTags.push(tag);
            removeObjectFromArray($scope.filterTags, tag, 'name');

            for (var i=$scope.filterTagsText.length-1; i>=0; i--) {
                if ($scope.filterTagsText[i] === tag.slug) {
                    $scope.filterTagsText.splice(i, 1);
                    break;
                }
            }
            $scope.go();
        }
    };

    /**
     * init category data by slug
     */
    $http.get('/api/category/' + $scope.slug ).success(function(data) {
        $scope.category = data.category;

        Page.setTitleWithPrefix($scope.category.name);

        // once we get the complete category structure, we operate by id
        $http.get('/api/category/' + $scope.category._id + '/courseTags').success(function(data) {
            $scope.courseTags = data.courseTags;
            $scope.availableTags = data.courseTags;

            $scope.initTagFromSearch();
        });
    });
});
;app.controller('MapController', function ($scope, $http, $rootScope,
                                          $timeout, $sce, $location,
                                          toastr, mapService, courseService) {

    $scope.treeNodes = [];
    $scope.jsPlumbConnections = [];
    $scope.widgets = [];
    $scope.isTreeInitiated = false;
    $scope.isCurrentTabIsMap = false;
    $scope.infoToast = null;
    $scope.infoEmptyToast = null;
    $scope.nodeModaltitle = "";
    $scope.currentNodeAction = {};

    /**
     * find node recursively
     *
     * @param obj
     * @param col next search will be the array value of this key
     * @param searchKey
     * @param searchValue
     * @returns {*}
     */
    var found = false;
    $scope.findNode = function (obj, col, searchKey, searchValue) {
        if (found)
            return found;

        for (var i in obj) {
            var tn = obj[i];

            if (tn[searchKey] && tn[searchKey] == searchValue) {
                found = tn;
                return tn;
            }
            else if (tn[col] && tn[col].length > 0) {
                // search again
                $scope.findNode(tn[col], col, searchKey, searchValue);
            }
        }

        if (found)
            return found;
    };

    $scope.initDropDownMenuHybrid = function () {
        $('#tree .course-map').on('click', function (event) {
            var target = $(event.target);
            var k = target.parents('div');
            if (k.hasClass('ui-draggable') && k.hasClass('w')) {
                return true;
            } else if (k.hasClass('center-course')) {
                return true;
            } else if (target.hasClass('w')) {
                return true;
            }

            if ($('.open').length > 0) {
                $('.open').removeClass('open');
                return false;
            }
        });
    };

    /**
     * get all categories, recursived on the server
     */
    $scope.initTab = function (course) {
        // add hover to center instantiate on hover
        $scope.initDropDown('center');

        mapService.init(course._id,

            function (treeNodes) {
                if (treeNodes.length > 0) {
                    $scope.treeNodes = treeNodes;
                } else {
                    $scope.initJSPlumb();
                    $scope.showMapEmptyInfo();
                }
            },

            function (err) {
                console.log(err);
                toastr.error('cannot load course tree');
            }
        );
    };

    $scope.tabOpened = function () {

        if (courseService.course) {
            $scope.course = courseService.course;

            if (mapService.treeNodes) {
                $scope.treeNodes = mapService.treeNodes;
            }

            $scope.initTab(courseService.course);
        } else {

            $scope.$on('onAfterInitCourse', function (event, course) {
                $scope.initTab(course);
            });
        }

        $rootScope.$broadcast('onCoursePreviewTabOpened', $scope.currentTab);
    };

    // initiate draggable jqUI to the topic node
    $scope.initDraggable = function (jsPlumbInstance) {
        var w = window.innerWidth;
        var h = window.innerHeight;

        // let us drag and drop the cats
        var mapEl = jsPlumb.getSelector(".course-map .w.owned");
        jsPlumbInstance.draggable(mapEl, {
            // update position on drag stop
            stop: function () {
                var el = $(this);
                var pos = el.position();
                var distanceFromCenter = {
                    x: pos.left - Canvas.w / 2,
                    y: pos.top - Canvas.h / 2
                };

                var nId = el.attr('id').substring(1); // remove 't' from the node id
                found = false;
                var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nId);

                $http.put('/api/treeNodes/' + nId + '/positionFromRoot', distanceFromCenter)
                    .success(function (res, status) {
                        //console.log(res);
                        if (pNode)
                            pNode.positionFromRoot = distanceFromCenter;
                    })
                    .error(function (res, status) {
                        console.log('err');
                        console.log(res);
                    });
            }
        });
    };

    $scope.initJSPlumb = function () {
        Tree.init(Canvas.w, Canvas.h);

        var instance;

        $scope.instance = instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
            ConnectionOverlays: [],
            Container: "course-map"
        });

        $scope.initDraggable(instance);

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.treeNodes, instance);

            /*blanket on click to close dropdown menu*/
            $scope.initDropDownMenuHybrid();
        });
    };

    $scope.initDropDown = function (slug) {
        $('#' + slug)
            .on('click mousedown mouseup touchstart', function (event) {
                if ($(this).find('ul').hasClass('open')) {
                    if ($(this).find('ul').hasClass('dropdown-course')) {
                        return true;
                    }

                    $('.open').removeClass('open');
                    return false;
                }

                $('.open').not($(this).parents('ul')).removeClass('open');
                $(this).find('ul').addClass('open');

                return false;
            })
            .on('mouseenter', function () {
                $scope.requestIconAnalyitics(slug);
            });
    };

    $scope.showMapInfo = function () {
        if (!$scope.infoToast) {
            $scope.infoToast = toastr.info(
                'To add a pdf or a video node (which we call "Content Node"), ' +
                '<br>you need to have at least a subtopic node that acts as a hub.' +
                '<br>' +
                '<br>Hover over the node to see available actions, such as create subtopic or content node'
                , {
                    allowHtml: true,
                    autoDismiss: false,
                    onHidden: function () {
                        if ($scope.infoToast)$scope.infoToast = null;
                    },
                    tapToDismiss: true,
                    extendedTimeOut: 10000,
                    timeOut: 10000,
                    toastClass: 'toast wide',
                });
        } else {
            toastr.clear();
            $scope.infoToast = null;
        }
    };

    $scope.showMapEmptyInfo = function () {
        if (!$scope.infoEmptyToast) {
            $scope.infoEmptyToast = toastr.info(
                'Hi, this course is new, Please add a subtopic first, ' +
                '<br>from there, you can add a content node, then upload a pdf or a video.' +
                '<br>' +
                '<br>Hover over the center node to see available actions.'
                , {
                    allowHtml: true,
                    autoDismiss: false,
                    onHidden: function () {
                        if ($scope.infoEmptyToast)$scope.infoEmptyToast = null;
                    },
                    tapToDismiss: true,
                    extendedTimeOut: 10000,
                    timeOut: 10000,
                    toastClass: 'toast wide',
                });
        } else {
            toastr.clear();
            $scope.infoEmptyToast = null;
        }
    };

    $scope.interConnect = function (parent, treeNodes, instance) {
        // added "t" in id because id cannot start with number
        for (var i in treeNodes) {
            var child = treeNodes[i];
            var childId = 't' + child._id;

            if (child.isDeletedForever)
                continue;

            // instantiate on hover
            $scope.initDropDown(childId);

            // connecting parent and chidlern
            var conn = instance.connect({
                source: parent, target: childId,
                anchors: [
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape")}],
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + childId)[0].getAttribute("data-shape")}]
                ],
                connector: ["Bezier", {curviness: 5}]
            });

            $scope.jsPlumbConnections.push(conn);

            if (child.childrens) {
                $scope.interConnect(childId, child.childrens, instance);
            }
        }
    };

    $scope.goToDetail = function (categorySlug) {
        window.location.href = "/courses/#/category/" + categorySlug;
    };

    $scope.setMode = function (mode, type, parent) {
        switch (mode) {
            case 'add':
                $scope.currentNodeAction.mode = "add";
                break;
            case 'edit':
                $scope.currentNodeAction.mode = "edit";
                break;
        }

        switch (type) {
            case 'subTopic':
                $scope.currentNodeAction.type = "subTopic";
                $scope.currentNodeAction.typeText = "Sub Topic";
                break;

            case 'contentNode':
                $scope.currentNodeAction.type = "contentNode";
                $scope.currentNodeAction.typeText = "Content Node";
                break;
        }

        $scope.nodeModaltitle = $scope.currentNodeAction.mode + " " + $scope.currentNodeAction.typeText;

        if (parent) {
            $scope.currentNodeAction.parent = parent;
            if (mode == 'add')
                $scope.nodeModaltitle += " under " + parent.name;
        }
        else
            $scope.currentNodeAction.parent = false;

        $rootScope.$broadcast('onAfterSetMode', $scope.course);
    };

    $scope.parseResources = function () {
        for (var i = 0; i < $scope.currentNodeAction.parent.resources.length; i++) {
            var content = $scope.currentNodeAction.parent.resources[i];
            if (content['type'] == 'mp4'
                || content['type'] == 'video'
                || content['type'] == 'videoLink'
            ) {
                $scope.currentNodeAction.parent.videoFile = content;
            } else if (content['type'] == 'pdf'
                || content['type'] == 'pdfLink'
            ) {
                $scope.currentNodeAction.parent.pdfFile = content;
            }
        }
    };

    /**
     * remove all svg generated by js plumb.
     */
    $scope.destroyJSPlumb = function () {
        for (var i in $scope.jsPlumbConnections) {
            var conn = $scope.jsPlumbConnections[i];
            jsPlumb.detach(conn);
        }

        $scope.jsPlumbConnections = [];
    };

    $scope.resourceIcon = function (filetype) {
        switch (filetype) {
            case 'pdf':
            case 'pdfLink':
                return 'fa fa-file-pdf-o';

            case 'mp4':
            case 'videoLink':
            case 'video':
                return 'fa fa-file-video-o';
        }
    };

    $scope.getDataShape = function (nodeType) {
        if (nodeType == 'subTopic')
            return 'Ellipse';

        return 'Rectangle';
    };

    $scope.requestIconAnalyitics = function (nodeId) {
        nodeId = nodeId.substring(1);
        $http.get('/api/server-widgets/topic-icon-analytics/?nodeId=' + nodeId).success(
            function (res) {
                $scope.isRequesting = false;
                if (res.result) {
                    $scope.widgets[nodeId] = $sce.trustAsHtml(res.widgets);
                }
            }
        ).error(function () {
            $scope.isRequesting = false;
        });
    };

    $scope.getContentNodeLink = function (d) {
        return '/treeNode/' + d._id + '/#/cid/' + $scope.course._id + '/nid/' + d._id;
    };

    $scope.deleteNode = function (data) {
        var msg = '';
        if (data.type == 'subTopic') {
            msg = 'Are you sure you want to delete this sub topic?';
        }
        else {
            msg = 'Are you sure you want to delete this content node?';
        }

        if (confirm(msg)) {
            $http({
                method: 'DELETE',
                url: '/api/treeNodes/' + data._id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (res) {
                    //console.log(res);
                    if (res.result) {
                        data.isDeleted = true;
                        data.name = '[DELETED]';

                        // destroy the jsplumb instance and svg rendered
                        $scope.destroyJSPlumb();

                        // this will reinitiate the model, and thus also jsplumb connection
                        $scope.treeNodes = angular.copy($scope.treeNodes);
                        $timeout(
                            function () {
                                $scope.$apply();
                                $scope.initJSPlumb();
                            });

                    } else {
                        if (data.result != null && !data.result) {
                            $scope.errors = data.errors;
                            console.log(data.errors);
                        }
                    }
                });
        }
    };

    $scope.deleteNodeForever = function (data) {
        var msg = 'Are you sure you want to delete this content node forever?';
        if (data.type == 'subTopic') {
            msg = 'Are you sure you want to delete this sub topic forever?';
        }

        if (confirm(msg)) {
            $http({
                method: 'DELETE',
                url: '/api/treeNodes/' + data._id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (res) {
                    if (res.result) {
                        data.isDeleted = true;
                        data.isDeletedForever = true;
                        data.name = '[DELETED]';

                        // destroy the jsplumb instance and svg rendered
                        $scope.destroyJSPlumb();

                        // this will reinitiate the model, and thus also jsplumb connection
                        $scope.treeNodes = angular.copy($scope.treeNodes);
                        $timeout(
                            function () {
                                $scope.$apply();
                                $scope.initJSPlumb();
                            });

                    }
                })
                .error(function (data) {
                    $scope.errors = data.errors;
                    toastr.error(data.errors);
                });
        }
    };

    $scope.isOwner = function (tn) {
        return tn.createdBy == $scope.user._id;
    };

    $scope.isAuthorized = function (tn) {
        return ($scope.isOwner(tn) || $scope.isAdmin || $scope.isManager);
    };

    $scope.$on('onAfterCreateNode', function (event, treeNode) {
        if (treeNode.parent) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode.parent);

            if (pNode) {
                pNode.childrens.push(treeNode);
            }
        }
        else
            $scope.treeNodes.push(treeNode);

        // destroy the jsplumb instance and svg rendered
        $scope.destroyJSPlumb();

        // this will reinitiate the model, and thus also jsplumb connection
        $scope.treeNodes = angular.copy($scope.treeNodes);
        $timeout(
            function () {
                $scope.$apply();
                $scope.initJSPlumb();

                if ($('.open').length > 0) {
                    $('.open').removeClass('open');
                    return true;
                }
            });
    });

    $scope.$on('onAfterEditNode', function (event, treeNode) {
        if (treeNode) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode._id);
            if (pNode) {
                pNode.name = treeNode.name;
            }
        }

        $timeout(
            function () {
                $scope.$apply();
            });
    });

    $scope.$on('onAfterEditContentNode', function (event, treeNode) {
        if (treeNode) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode._id);
            if (pNode) {
                pNode.name = treeNode.name;
                if (treeNode.resources.length > 0) {
                    for (var i in treeNode.resources) {
                        pNode.resources.push(treeNode.resources[i]);
                    }
                }
            }
        }

        $timeout(
            function () {
                $scope.$apply();
            });
    });

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        $scope.isTreeInitiated = true;
    });

    $scope.$on('onAfterSetMode', function (event, course) {
        if ($scope.currentNodeAction.type == "contentNode") {
            $scope.parseResources();
        }
    });

    $scope.$watchGroup(['isTreeInitiated', 'isCurrentTabIsMap'], function (oldVal, newVal) {
        if ($scope.isTreeInitiated === true && $scope.isCurrentTabIsMap === true) {
            $scope.initJSPlumb();
        }
    });

    $scope.$watch(function () {
        return $location.search()
    }, function (newVal, oldVal) {
        var currentTab = $location.search().tab;
        if (currentTab == 'map') {
            $scope.isCurrentTabIsMap = true;
        }
    }, true);

    $(document).ready(function () {
        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x: $scope.width / 2, y: ($scope.height / 2) - 100};
    });

    $scope.tabOpened();
});
;app.controller('NodeConfigController', function ($scope, $http, toastr, $window) {
    $scope.nodeEdit = null;
    $scope.errors = [];
    $scope.username = '';
    $scope.isLoading = false;
    $scope.tabsActive = {};
    $scope.settings = {
        disableControls: false,
        disableTop: false
    };

    $scope.$on('onAfterInitTreeNode', function (event, treeNode) {
        $scope.init(treeNode);
    });

    $scope.init = function (treeNode) {
        if (!treeNode)
            return;

        $scope.nodeEdit = cloneSimpleObject(treeNode);
    };

    $scope.saveNodeSetting = function (isValid) {
        if (!isValid)
            return;

        var url = '/api/treeNodes/' + $scope.nodeEdit._id;

        var params = {};

        if ($scope.tabsActive) {
            params.tabsActive = $scope.tabsActive;
        }
        if ($scope.settings) {
            params.settings = $scope.settings;
        }

        $scope.isLoading = true;
        $http.put(url, params)
            .success(function (res) {
                if (res.result) {
                    toastr.success('Successfully Saved');
                }

                $scope.isLoading = false;
                $('#configView').modal('hide');
                $scope.errors = [];

                $window.location.reload();
            })
            .error(function (res) {
                $scope.errors = res.errors;
                $scope.isLoading = false;
            });
    };

    $scope.cancel = function () {
        $scope.nodeEdit = cloneSimpleObject($scope.$parent.treeNode);
    };
});
;
;app.controller('NodeEditController', function($scope, $http, $rootScope, Upload, toastr, $timeout) {

    $scope.formData = {};
    $scope.filespdf = [];
    $scope.filesvideo = [];
    $scope.currentEditNode = false;
    $scope.progressPercentage = 0;
    $scope.videoHostLink = '';
    $scope.pdfHostLink = '';

    $scope.isLoading = false;
    $scope.errors = [];

    $scope.init = function(){
    };

    $scope.$on('onAfterSetMode', function(event, course, treeNode){
        $scope.formData.courseId = course._id;

        if($scope.currentNodeAction.parent)
            $scope.formData.parent = $scope.currentNodeAction.parent._id;
        else {
            if($scope.formData.parent)
                delete $scope.formData.parent;
        }

        $scope.currentEditNode = $scope.currentNodeAction.parent;
        $scope.currentEditNodeOriginal = cloneSimpleObject($scope.currentNodeAction.parent);
        $scope.formData.type = $scope.currentNodeAction.type;

        if(treeNode){
            $scope.formData.name = treeNode.name;
            $scope.formData.nodeId = treeNode._id;
            $scope.currentEditNode = treeNode;
        }
    });

    $scope.parseNgFile = function(ngFile){
        var t = ngFile.type.split('/')[1];

        var ret = {
            type: t
        };

        return ret;
    };

    /**
     * save add sub topic node
     */
    $scope.saveNode = function(isValid){
        if(!isValid)
            return;

        $scope.isLoading = true;
        var d = transformRequest($scope.formData);
        $http({
            method: 'POST',
            url: '/api/treeNodes',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                if(data.result) {
                    $rootScope.$broadcast('onAfterCreateNode', data.treeNode);

                    $('#addSubTopicModal').modal('hide');
                    $('#addContentNodeModal').modal('hide');

                    // cleaining up formData
                    if($scope.formData.parent) {
                        delete $scope.formData.parent;
                        $timeout(function(){$scope.$apply()});
                    }
                    $scope.formData.name = "";

                    $scope.isLoading = false;
                    $scope.addSubTopicForm.$setPristine();

                    toastr.success('Successfully Saved, You can move it away from its default position');
                }
            })
            .error(function(data){
                $scope.errors = data.errors;
                $scope.isLoading = false;

                toastr.error('Saving Failed');
            })
        ;
    };

    /**
     * save edit sub topic node
     */
    $scope.saveEditNode = function(isValid){
        if(!isValid)
            return;

        var updateValue = {
            name: $scope.currentEditNode.name
        };

        $scope.isLoading = true;

        var d = transformRequest(updateValue);
        $http({
            method: 'PUT',
            url: '/api/treeNodes/' + $scope.currentEditNode._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                $scope.isLoading = false;
                if(data.result) {
                    $rootScope.$broadcast('onAfterEditNode', data.treeNode);

                    if($scope.formData.parent) {
                        $scope.currentEditNode = {};
                        delete $scope.formData.parent;
                        $timeout(function(){$scope.$apply()});
                    }

                    $('#editSubTopicModal').modal('hide');
                    $('#editContentNodeModal').modal('hide');

                    $scope.editSubTopicForm.$setPristine();
                    toastr.success('Successfully Saved');
                }
            })
            .error(function(data){
                $scope.isLoading = false;
                $scope.errors = data.errors;
                toastr.error('Saving Failed');
            });
    };

    /**
     * save add content node
     * save edit content node
     */
    $scope.saveContentNode = function(isValid){
        if(!isValid)
            return;

        if($scope.currentNodeAction.mode == 'edit'){
            $scope.formData = $scope.currentEditNode;
        }

        if($scope.videoHostLink.trim() != ''){
            $scope.formData.videoHostLink = $scope.videoHostLink;
        }
        if($scope.pdfHostLink.trim() != ''){
            $scope.formData.pdfHostLink = $scope.pdfHostLink;
        }

        var uploadParams = {
            url: '/api/treeNodes',
            fields: $scope.formData
        };

        uploadParams.file = [];

        // we only take one pdf file
        if ($scope.filespdf && $scope.filespdf.length){
            uploadParams.file.push($scope.filespdf[0]);
        }
        // we only take one vid file
        if ($scope.filesvideo && $scope.filesvideo.length){
            uploadParams.file.push($scope.filesvideo[0]);
        }

        $scope.isLoading = true;

        $scope.upload = Upload.upload(
            uploadParams

        ).progress(function (evt) {
                if(!evt.config.file)
                    return;

                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);

            }).success(function (data, status, headers, config) {

                if(data.result) {
                    data.treeNode['resources'] = [];
                    for(var i in uploadParams.file){
                        var f = uploadParams.file[i];
                        var resTemp = $scope.parseNgFile(f);
                        data.treeNode['resources'].push(resTemp);
                    }

                    if($scope.videoHostLink != ''){
                        data.treeNode['resources'].push({
                            type: 'videoLink'
                        });
                    }

                    if($scope.pdfHostLink != ''){
                        data.treeNode['resources'].push({
                            type: 'pdfLink'
                        });
                    }
                }

                if($scope.addContentNodeForm) {
                    $rootScope.$broadcast('onAfterCreateNode', data.treeNode);

                    $('#addSubTopicModal').modal('hide');
                    $('#addContentNodeModal').modal('hide');

                    // cleaning up formData
                    $scope.formData.name = "";
                    $scope.filespdf = [];
                    $scope.filesvideo = [];

                    if($scope.formData.parent)
                        delete $scope.formData.parent;

                    $scope.addContentNodeForm.$setPristine();

                    toastr.success('Content Node has been created, You can move it away from its default position');
                } else if($scope.editContentNodeForm){
                    $rootScope.$broadcast('onAfterEditContentNode', data.treeNode);

                    $('#editContentNodeModal').modal('hide');
                    $scope.editContentNodeForm.$setPristine();

                    toastr.success('Successfully Saved');
                }

                $scope.videoHostLink = '';
                $scope.pdfHostLink = '';
                $scope.progressPercentage = 0;
                $scope.isLoading = false;
            })
            .error(function(data){
                $scope.isLoading = false;
                $scope.errors = data.errors;

                $scope.progressPercentage = 0;

                toastr.error('Saving Failed');
            });

    };

    $scope.cancel = function(){
        if($scope.upload){
            $scope.upload.abort();
        }

        $scope.currentEditNode.name = $scope.currentEditNodeOriginal.name;
    };

    $scope.clearVideo = function(){
        $scope.filesvideo=[];
        $timeout(function(){$scope.$apply()});
    };

    $scope.clearPdf = function(){
        $scope.filespdf=[];
        $timeout(function(){$scope.$apply()});
    };
});
;app.controller('NodeRootController', function ($scope, $rootScope, $filter, $http, $location,
                                               $routeParams, $timeout, ActionBarService, authService,
                                               courseService, treeNodeService, Page, toastr) {
    $scope.treeNode = null;
    $scope.course = null;
    $scope.nodeId = $routeParams.nodeId;
    $scope.courseId = $routeParams.courseId;

    $scope.isNodeOwner = false;
    $scope.isAdmin = false;
    $scope.isManager = false;
    $scope.isOwner = false;
    $scope.isEnrolled = false;
    $scope.videoFile = false;
    $scope.pdfFile = false;

    $scope.currentTab = "";
    $scope.tabDisplayName = "";
    $scope.currentPdfPage = 1;
    $scope.defaultPath = "";
    $scope.includeActionBar = "";
    $scope.currentNodeAction = {};

    $scope.manageActionBar = function () {
        if (($scope.currentTab == 'video' || $scope.currentTab == 'pdf') && $scope.treeNode) {
            if ($scope.treeNode.createdBy == $rootScope.user._id) {

                ActionBarService.extraActionsMenu = [];
                ActionBarService.extraActionsMenu.push({
                    clickAction: $scope.deleteNode,
                    clickParams: $scope.treeNode._id,
                    title: '<i class="ionicons ion-close"></i> &nbsp;DELETE',
                    aTitle: 'DELETE THIS NODE AND ITS CONTENTS'
                });
            }
        }
    };

    $scope.changeTab = function () {
        var q = $location.search();

        if (!q.tab) {
            jQuery('li.video').removeClass('active');
            jQuery('li.pdf').removeClass('active');

            if ($scope.videoFile && $scope.pdfFile) {
                jQuery('li.video').addClass('active');
            } else if ($scope.pdfFile) {
                jQuery('li.pdf').addClass('active');
            } else {
                jQuery('li.video').addClass('active');
            }
        }

        if ($scope.videoFile || ($scope.videoFile && $scope.pdfFile)) {
            $scope.defaultPath = 'video';
        } else if ($scope.pdfFile) {
            $scope.defaultPath = 'pdf';
        }

        $scope.currentTab = $scope.defaultPath;
        if (q.tab) {
            $scope.currentTab = q.tab;
        }

        $scope.include = '/treeNode/tab/' + $scope.currentTab;
        $scope.includeActionBar = '/treeNode/actionBar/' + $scope.currentTab;

        $rootScope.$broadcast('onNodeTabChange', $scope.currentTab);

        $scope.getTabDisplayName($scope.currentTab);

        $scope.manageActionBar();
    };

    $scope.getTabDisplayName = function (name) {
        $scope.tabDisplayName = $('li.' + name).attr('data-displayName');
    };

    $scope.initNode = function () {
        courseService.init(
            $scope.courseId,

            function (course) {
                $scope.course = course;

                treeNodeService.init($scope.nodeId,
                    function (treeNode) {
                        $scope.treeNode = treeNode;
                        $scope.videoFile = treeNodeService.videoFile;
                        $scope.pdfFile = treeNodeService.pdfFile;

                        $scope.setCapabilities();

                        Page.setTitleWithPrefix($scope.course.name + ' > Map > ' + $scope.treeNode.name);

                        if ($scope.treeNode.createdBy == $rootScope.user._id) {
                            $scope.isNodeOwner = true;
                            $scope.setEditMode();
                        }

                        $scope.changeTab();

                        $timeout(function () {
                            $scope.$broadcast('onAfterInitTreeNode', $scope.treeNode);
                        });
                    },
                    function (err) {
                        toastr.error(err);

                        $timeout(function () {
                            if (!authService.isLoggedIn && $scope.course) {
                                window.location.href = '/course/' + $scope.course.slug + '/#/cid/' + $scope.course._id + '?tab=preview';
                            }
                        });
                    }
                );
            },

            function (res) {
                $scope.errors = res.errors;
                toastr.error('Failed getting course');
            },

            true
        );
    };

    $scope.setEditMode = function () {
        $scope.currentNodeAction.mode = "edit";
        $scope.currentNodeAction.type = "contentNode";
        $scope.currentNodeAction.typeText = "Content Node";
        $scope.currentNodeAction.parent = $scope.treeNode;
        $scope.nodeModaltitle = "Edit " + $scope.currentNodeAction.typeText;
        $rootScope.$broadcast('onAfterSetMode', $scope.course, $scope.treeNode);
    };

    $scope.setCapabilities = function () {
        $scope.isEnrolled = courseService.isEnrolled();
        $scope.isManager = courseService.isManager(authService.user);
        $scope.isAdmin = authService.isAdmin();
        $scope.isOwner = authService.user._id == $scope.course.createdBy._id;
    };


    $scope.$on('onAfterEditContentNode', function (event, oldTreeNode) {
        window.location.reload();
    });

    /**
     * ping server on our latest page read
     */
    $scope.$on('onPdfPageChange', function (event, params) {
        $http.get('/slide-viewer/read/' + $scope.courseId + '/' + $scope.nodeId + '/' + $scope.pdfFile._id + '/' + params[0] + '/' + params[1]);


    });

    /**
     * ping server on some actions
     */
    var pdfPageChangeListener = $scope.$on('onPdfPageChange', function (event, params) {
        $http.get('/slide-viewer/read/' + $scope.courseId + '/' + $scope.nodeId + '/' + $scope.pdfFile._id + '/' + params[0] + '/' + params[1]);

        /*var q = $location.search();
         if (!q.tab) {
         if ($scope.currentTab == 'pdf' && params[0] > 1) {
         $location.search({'tab': 'pdf'});
         }
         }*/

        if (params[0] && params[0] != 1)
            $scope.currentPdfPage = params[0];
    });

    $scope.$on('onVideoUpdateState', function (e, data) {
        $http.put('/api/treeNodes/watch/' + $scope.courseId + '/' + $scope.nodeId + '/' + $scope.videoFile._id,
            {
                state: data.state,
                totalTime: data.API.totalTime,
                currentTime: data.API.currentTime,
                timeLeft: data.API.timeLeft,
                volume: data.API.volume
            }
            )
            .error(function (data) {
                console.log('ping server error');
            });
    });

    $scope.$on('$destroy', pdfPageChangeListener);

    $scope.$on('$routeUpdate', function () {
        var q = $location.search();

        if (q.tab) {
            if ($scope.currentTab && $scope.currentTab != q.tab) {
                $scope.changeTab();
            }
        }
        else
            $scope.changeTab();
    });

    /**
     * initiate course when user hast tried to log in
     */
    $scope.$watch(function () {
        return authService.isLoggedIn;
    }, function () {
        if (authService.hasTriedToLogin && !$scope.course) {
            $scope.initNode();
        }
    });
});
;app.controller('PdfTabController', function ($scope, $rootScope, $filter, $http, $location,
                                             $routeParams, $timeout, ActionBarService) {

    $scope.init = function () {
        if ($scope.currentPdfPage > 1) {
            var slidePage = $location.search().slidePage;
            if (!slidePage || (slidePage && slidePage == 1)) {
                $location.search('slidePage', $scope.currentPdfPage).replace();
            }
        }
    };

    $scope.init();
});
;app.controller('ProfileController', function(  Page) {
    Page.setTitleWithPrefix('My Account');
});
;app.controller('VideoTabController', function ($scope, $rootScope, $filter, $http, $location,
                                               $routeParams, $timeout, ActionBarService) {

});
;app.directive('comment',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                postedBy: '@',
                postedDate: '@',
                showControl: '=',
                showReplyButton: '=',
                showEditButton: '=',
                showDeleteButton: '=',
                authorClickAction: '&',
                authorClickable: '=',
                postContent: '=',
                isPostOwner: '=',
                isDeleted: '=',
                postId: '@',
                editAction: '&',
                deleteAction: '&',
                replyAction: '&'
            },

            templateUrl: '/angular/views/discussion.reply.html'/*,

            link: function (scope, element, attrs) {
                $timeout(function () {
                    scope.$apply();
                });

                $compile(element.contents())(scope.$new());
            }*/
        };
    });;app.directive('errorBlock',
    function () {
        return {
            restrict: 'E',
            scope: {
                messages: '='
            },
            template: '<div class="errors">' +
                      '<div class="alert alert-danger" role="alert" ng-repeat="m in messages">{{m}}</div>' +
                      '</div>'
        };
    });;app.directive('facebookButton',
    function () {
        return {
            restrict: 'E',
            terminal: true,
            template:
                '<div class="control-group">' +
                    '<a href="/api/accounts/login/facebook">' +
                    '<img src="/admin-lte/images/fb.png">' +
                    '</a>' +
                '</div>'
    };
});;
app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});

app.directive('script', function($parse, $rootScope, $compile) {
    return {
        restrict: 'E',
        terminal: true,
        link: function(scope, element, attr) {
            if (attr.ngSrc) {
                var domElem = '<script src="'+attr.ngSrc+'" async defer></script>';
                $(element).append($compile(domElem)(scope));
            }
        }
    };
});;app.directive('modalBox',
    function ($compile, $timeout, $rootScope) {
        return {
            restrict: 'E',

            terminal: true,
            transclude: true,

            scope: {
                mid: '@',
                title: '@'
            },

            templateUrl: '/angular/views/modal-box.html',

            link: function (scope, el, attrs) {
            }
        };
    });
;app.directive('cancel',
    function () {
        return {
            restrict: 'E',
            template: '<button type="button" class="btn btn-warning"' +
            'data-dismiss="modal" aria-label="Close"' +
            'ng-click="cancel()">' +
            '<span aria-hidden="true">Cancel</span>' +
            '</button>'
        };
    });

app.directive('modalClose',
    function () {
        return {
            restrict: 'E',
            template: '<div class="box-tools pull-right"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>'
        };
    });;/*jslint node: true */
'use strict';

app.directive('movable', function() {
    var getRelativePosition = function(position, parent) {
        return {
            left: Math.round((100 * position.left / parent.clientWidth)),
            top: Math.round((100 * position.top / parent.clientHeight))
        };
    };

    var getRelativeSize = function(size, parent) {
        return {
            width: Math.round((100 * size.width / parent.clientWidth)),
            height: Math.round((100 * size.height / parent.clientHeight))
        };
    };

    return {
        restrict: 'A',
        scope: {
            onMoved: '=',
            canMove: '@'
        },
        link: function(scope, element, attrs) {
            attrs.$observe('canMove', function(value) {
                if (value === 'false') {
                    element.draggable({
                        disabled: true
                    }).resizable({
                        disabled: true
                    });
                } else {
                    element.draggable({
                        disabled: false
                    }).resizable({
                        disabled: false
                    });
                }
            });

            element
                .draggable({
                    containment: 'parent',
                    cursor: 'move',
                    stop: function(event, ui) {
                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getRelativePosition(ui.position, element.parent()[0])
                            });
                        }
                    }
                })
                .resizable({
                    containment: 'parent',
                    handles: 'ne, se, sw, nw',
                    stop: function(event, ui) {
                        if (scope.onMoved) {
                            var parent = element.parent()[0];
                            scope.onMoved({
                                position: getRelativePosition(ui.position, parent),
                                size: getRelativeSize(ui.size, parent)
                            });
                        }
                    }
                });

            // remove event handlers
            scope.$on('$destroy', function() {
                element.off('**');
            });
        }
    };
});
;/*jslint node: true */
'use strict';

app.directive('movablePdf', function() {
    var getRelativePosition = function(position, parent) {
        return {
            left: 1.0 * position.left / $("#annotationZone").width(),
            top: 1.0 * position.top / $("#annotationZone").height()
        };
    };

    var getRelativeSize = function(size, parent) {
        return {
            width: 1.0 * size.width / $("#annotationZone").width(),
            height: 1.0 * size.height / $("#annotationZone").height()
        };
    };

      return {
        restrict: 'A',
        scope: {
            onMoved: '=',
            canMove: '@'
        },
        link: function(scope, element, attrs) {
            attrs.$observe('canMove', function(value) {
                if (value === 'false') {
                    element.draggable({
                        disabled: true
                    }).resizable({
                        disabled: true
                    });
                } else {
                    element.draggable({
                        disabled: false
                    }).resizable({
                        disabled: false
                    });
                }
            });

            element
                .draggable({
                    containment: $("#annotationZone"),
                    cursor: 'move',
                    stop: function(event, ui) {
                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getRelativePosition(ui.position, $("#annotationZone"))
                            });
                        }
                    }
                })
                .resizable({
                    containment: $("#annotationZone"),
                    handles: 'ne, se, sw, nw',
                    stop: function(event, ui) {
                        if (scope.onMoved) {
                            var parent = $("#annotationZone");
                            scope.onMoved({
                                position: getRelativePosition(ui.position, parent),
                                size: getRelativeSize(ui.size, parent)
                            });
                        }
                    }
                });

            // remove event handlers
            scope.$on('$destroy', function() {
                element.off('**');
            });
        }
    };
});
;app.directive('pagination',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            scope: {
                totalRows: '=',
                limit: '=',
                useSearch: '=',
                objectService: '@',
                sortBy: '@',
                orderBy: '@',
                successCb: '='
            },

            templateUrl: '/angular/views/pagination.html',

            link: function (scope, element, attrs) {
                attrs.$observe('objectService', function () {
                    var factoryInstance = element.injector().get(scope.objectService);
                    scope.objectServiceInstance = factoryInstance;
                    factoryInstance.setPageParams(scope);
                });
            },

            controller: function ($http, $scope, $location) {
                $scope.showMoreButton = false;
                $scope.currentPage = 1;
                $scope.lastPage = $scope.currentPage * $scope.limit;

                $scope.$watch('totalRows', function () {
                    if ($scope.totalRows / $scope.currentPage >= $scope.limit) {
                        $scope.showMoreButton = true;
                    } else
                        $scope.showMoreButton = false;
                });

                $scope.showMoreRows = function () {
                    $scope.objectServiceInstance.setPageParams($scope);
                    $scope.objectServiceInstance.getMoreRows(function (newRows, allRows) {
                        $scope.totalRows = newRows.length;
                        // show more button if it has possibilities of having more pages
                        if ($scope.totalRows >= $scope.limit) {
                            $scope.showMoreButton = true;
                        } else
                            $scope.showMoreButton = false;

                        $scope.successCb(newRows, allRows);
                    });

                    $scope.currentPage++;
                    $scope.lastPage = $scope.currentPage * $scope.limit;

                    if (!$scope.useSearch)
                        return;

                    $location.search('limit', $scope.limit);
                    $location.search('sortBy', $scope.sortBy);
                    $location.search('orderBy', $scope.orderBy);
                    $location.search('lastPage', $scope.lastPage);
                };
            }
        };
    });;app.directive('pdfAnnotationZone',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,
            require: 'movable-pdf',
            scope: {
              relativePositionX: '=',
              relativePositionY: '=',
              relativeSizeX: '=',
              relativeSizeY: '=',
              color: '=',
              tagName: '=',
              editTagNameTemp: '=',
              dragable: '=',
              isBeingCreated: '=',
              canBeEdited: '=',
              annZoneId: '=',
              divCounter: '=',
              listId: '=',
              switchShowAnnoZones: '=',
              tagNameIsValidated: '=',
              setEditZoneMode: '&',
              resetEditZoneMode: '&',
              updateAnnZone: '&',
              removeAnnotationZone: '&',
              addReference: '&',
            },

            templateUrl: '/angular/views/pdf-annotation-zone.html',
            //replace: true,
            //transclude: true,
            controller: function($http, $scope, $rootScope, $sce, $timeout, $parse){




/*              $scope.$watch('currCanWidth', function(newVal, oldVal){
                console.log("HERE");
                $scope.localCanWidth = newVal;
              });

              $scope.$watch('currCanHeight', function(newVal, oldVal){
                $scope.localCanHeight = newVal;
              });
*/

              $scope.localCanWidth = $('#annotationZone').width();
              $scope.localCanHeight = $('#annotationZone').height();

              $scope.localSetEditZoneMode = function(annId){
                $scope.setEditZoneMode({id:annId});
              };

              $scope.localResetEditZoneMode = function(){
                $scope.resetEditZoneMode();
              };

              $scope.localUpdateAnnZone = function(annId){
                $scope.updateAnnZone({id:annId});
              };

              $scope.localRemoveAnnotationZone = function(annId){
                $scope.removeAnnotationZone({id:annId});
              };

              $scope.localAddReference = function(annId){
                $scope.addReference({id:annId});
              };


              $scope.updateAnnZonePos = function(posSize){
                $scope.relativePositionY=posSize.position.top;
                $scope.relativePositionX= posSize.position.left;
                if(posSize.size != undefined){
                  $scope.relativeSizeX = posSize.size.width;
                  $scope.relativeSizeY = posSize.size.height;
                }
                $timeout(function(){
                  $scope.$apply();
                });
              };



              $rootScope.$on('pdfScaleChanged', function(event,params){
                console.log("Blub");

                $scope.localCanWidth = params[0];
                $scope.localCanHeight = params[1];
                console.log($scope.localCanWidth);
                $timeout(function(){
                  $scope.$apply();
                });
              });

              $scope.inEditMode = false;

              $rootScope.$on('editZoneModeChanged', function(event,param){
                if($scope.listId == param){
                  $scope.inEditMode = true;
                }
                else {
                  $scope.inEditMode = false;
                }
              });


              $scope.canMove = $scope.dragable;
              $scope.annZoneID = $scope.listId;
              $scope.opacityFactorHighlight = "0.75";
              $scope.tagName = $scope.tagName.slice(1);
              $scope.dataRelCoord = $scope.relativePositionX+";"+$scope.relativePositionY;





              $timeout(function(){
                $scope.$apply();
              });


              $('select[name="colorpicker-change-background-color"]').simplecolorpicker({picker: true, theme: 'glyphicons'});

              $('#destroy').on('click', function() {

                $('select').simplecolorpicker('destroy');
              });
              // By default, activate simplecolorpicker plugin on HTML selects
              $('#init').trigger('click');



            }
        };
    }
);
;app.directive('pdfComment',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                postedBy: '@',
                postedDate: '@',
                showControl: '=',
                showReplyButton: '=',
                //showEditButton: '=',
                //showDeleteButton: '=',
                authorClickAction: '&',
                authorClickable: '=',
                postContent: '=',
                isPostOwner: '=',
                postOwner: '=',
                isDeleted: '=',
                postId: '@',
                editAction: '&',
                deleteAction: '&',
                replyAction: '&',
                showCommentingArea: '=',
                comments: '=',
                postComment: '&',
                recentSubmitOnAnnotation: '=',
                commentText: '=',
                removeFunction: '&',
            },

            templateUrl: '/angular/views/pdf-comment.html',

            controller: function($http, $scope, $rootScope, $sce){
                //$scope.commentText = "";

                //console.log($scope.postComment);


                $scope.removeComment = function(commentId){
                    //var id = commentId;
                    $scope.removeFunction({id:commentId});
                    //alert(commentId);
                }


                var user = $rootScope.user;
                var isAuthor = $scope.postOwner === user.username;
                var isAdmin = user.role === 'admin';
                var hasPermission = (isAuthor || isAdmin);

                $scope.isAdmin = isAdmin;

                $scope.showEditButton = hasPermission;
                $scope.showDeleteButton = hasPermission;

                $scope.toggle = $scope.recentSubmitOnAnnotation;

                $scope.postedDate = new Date($scope.postedDate);

                //console.log($scope.postedDate | $scope.relativeDate);

                //console.log($scope.postId);
                //console.log($scope.toggle);
            }
        };
    });
;app.directive('pdfViewer',
    function ($compile, $timeout, $rootScope, $location, $routeParams) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                source: '@',
                currentPageNumber: '=',
                showControl: '=',
                pdfId: '@'
            },

            templateUrl: '/angular/views/pdf-viewer.html',

            link: function (scope, element, attrs) {
                if (!PDFJS.PDFViewer || !PDFJS.getDocument) {
                    alert('Please build the library and components using\n' +
                    '  `node make generic components`');
                }

                scope.pageToView = 1;
                scope.scale = 1.0;
                scope.totalPage = 1;

                scope.container = element[0].getElementsByClassName('viewerContainer');
                scope.container = scope.container[0];

                scope.calculateSlideNavigationProgress = function (newSlideNumber) {
                    if (scope.totalPage > 0) {
                        var progressBar = element[0].getElementsByClassName('slideNavigationCurrentProgress');
                        progressBar[0].style.width = ((newSlideNumber / scope.totalPage) * 100) + "%";
                    }
                };

                attrs.$observe('pdfId', function(pdfId){
                    $rootScope.pdfId = pdfId;
                });

                attrs.$observe('source', function (pdfFilePath) {
                    //console.log(pdfFilePath);
                    if (pdfFilePath) {
                        PDFJS.getDocument(pdfFilePath).then(function (pdfDocument) {

                            if (attrs.currentPageNumber) {
                                scope.pageToView = parseInt(attrs.currentPageNumber);
                            }

                            //console.log("Started loading pdf");
                            scope.totalPage = pdfDocument.numPages;

                            scope.calculateSlideNavigationProgress(scope.currentPageNumber);

                            // this will apply totalpage to the html
                            $timeout(function () {
                                scope.$apply();
                            });

                            // Document loaded, retrieving the page.
                            return pdfDocument.getPage(scope.pageToView).then(function (pdfPage) {
                                // Creating the page view with default parameters.
                                scope.pdfPageView = new PDFJS.PDFPageView({
                                    container: scope.container,
                                    id: scope.pageToView,
                                    scale: scope.scale,
                                    defaultViewport: pdfPage.getViewport(scope.scale),

                                    // We can enable text/annotations layers, if needed
                                    textLayerFactory: new PDFJS.DefaultTextLayerFactory(),
                                    annotationsLayerFactory: new PDFJS.DefaultAnnotationsLayerFactory()
                                });

                                // Associates the actual page with the view, and drawing it
                                scope.pdfPageView.setPdfPage(pdfPage);
                                scope.scale = scope.scale * scope.container.clientWidth / scope.pdfPageView.width;

                                scope.pdfPageView.update(scope.scale, 0);

                                scope.pdfIsLoaded = true;

                                $rootScope.$broadcast('onPdfPageChange', [scope.currentPageNumber, scope.totalPage]);



                                return scope.pdfPageView.draw();
                            });
                        });
                    }
                });

            }, /*end link*/

            controller: function ($scope, $rootScope, $compile, $http, $attrs, $location, $routeParams) {
                $scope.currentPageNumber = 1;
                $scope.pdfIsLoaded = false;
                $scope.totalPage = 0;
                $scope.currentTab = "";
                $scope.currentNavPageNumber = $scope.currentPageNumber;
                $rootScope.switchShowAnnoZones = "On";

                $scope.$watch("currentPageNumber", function (newVal, oldVal){
                  if(newVal!=oldVal){
                    $scope.currentNavPageNumber= newVal;

                    $timeout(function () {
                        $scope.$apply();
                    });
                  }
                });

                $scope.$watch("currentNavPageNumber", function (newVal, oldVal){
                  if(newVal!=oldVal){
                      if(newVal.length==0){
                        return;
                      }else if(isNaN(newVal)){
                          $scope.currentNavPageNumber=oldVal;

                      }else if(!(parseInt(newVal)>=1 && parseInt(newVal)<= $scope.totalPage)){
                          $scope.currentNavPageNumber=oldVal;
                      }
                  }
                });

                $("#inpFieldCurrPage").bind("keydown keypress", function (event) {
                  if(event.which === 13) {
                      $timeout(function () {
                          $scope.setPageNumber(parseInt($scope.currentNavPageNumber));
                          $scope.$apply();
                      });

                      event.preventDefault();
                  }

                });

                $scope.changePageNumber = function (value) {
                    $scope.setPageNumber($scope.currentPageNumber + value);
                };

                $scope.setPageNumber = function (value) {
                  if ((value) <= $scope.totalPage && (value) >= 1){
                    $scope.currentPageNumber = value;

                    $scope.setHistoryStack( $scope.currentPageNumber );

                    $timeout(function () {
                        $scope.changeSlide($scope.currentPageNumber);
                        $scope.$apply();
                    });
                  }
                };

                $scope.changeSlide = function (newSlideNumber) {
                    $rootScope.clearTagNameErrors();
                    $scope.pdfIsLoaded = false;

                    $scope.pageToView = newSlideNumber;

                    $scope.calculateSlideNavigationProgress(newSlideNumber);

                    PDFJS.getDocument($scope.source).then(function (pdfDocument) {
                        pdfDocument.getPage($scope.pageToView).then(function (pdfPage) {
                            $scope.pdfPageView.setPdfPage(pdfPage);
                            $scope.pdfPageView.draw().catch(function(){});

                            //console.log("Slide Changed");
                            $scope.pdfIsLoaded = true;


                            $rootScope.$broadcast('onPdfPageChange', [newSlideNumber, $scope.totalPage]);

                            /* todo: move this somewhere else
                             drawAnnZonesWhenPDFAndDBDone();
                             */
                        });
                    });
                };

                $scope.setHistoryStack = function (pageNumber) {
                    $location.search('slidePage', pageNumber);
                };

                $scope.changePageNumberBasedOnUrl = function () {
                    var q = $location.search();

                    if (q.slidePage) {
                        var pageNumFromUrl = parseInt(q.slidePage);

                        if ($scope.currentPageNumber != pageNumFromUrl && pageNumFromUrl > 0 && pageNumFromUrl <= $scope.totalPage) {
                            // we are back from somewhere we read it from the url.
                            $scope.currentPageNumber = pageNumFromUrl;
                            $scope.changeSlide($scope.currentPageNumber);
                        }
                    }
                };

                $scope.switchShowAnnotationZone =function(){
                  if($rootScope.switchShowAnnoZones=="On"){
                    $rootScope.switchShowAnnoZones="Off";
                  }else{
                    $rootScope.switchShowAnnoZones="On";
                  }

                };


                function adjustPdfScale () {
                  console.log("Adjusting PDF Scale");
                  if(typeof $scope.pdfPageView != 'undefined'){
                    if($scope.scale == 0)
                      $scope.scale = 1.0;

                    $scope.scale = $scope.scale * $scope.container.clientWidth / $scope.pdfPageView.width;
                    $scope.pdfPageView.update($scope.scale, 0);
                    $scope.pdfPageView.draw().catch(function(){});

                    $rootScope.currCanWidth = $('#annotationZone').width();

                    $rootScope.currCanHeight = $('#annotationZone').height();

                    $rootScope.$broadcast("pdfScaleChanged", [$rootScope.currCanWidth, $rootScope.currCanHeight]);

                  }
                };

                $(window).resize(function (event) {
                  //console.log("Registered resize. Got tab: " + $scope.currentTab +", callerId: "+event.target);
                  console.log($location.search().tab)
                  if(($location.search().tab == "pdf" || $location.search().tab == undefined || $location.search().tab == "no") && $.isWindow(event.target)) {
                    //console.log("Got called on resize");
                    adjustPdfScale();
                  }
                });

                $scope.$on('onAfterInitTreeNode', function(node){
                  //console.log("Got called");
                  //if($scope.pdfReady) {
                    //console.log(node);
                    $rootScope.pdfId = node.targetScope.pdfFile._id;
                  //}
                });

                $scope.$on('onNodeTabChange', function(event, tab){
                  //console.log("Registered tab change. Got tab: " + tab);
                  $scope.currentTab = tab;
                  if(tab == "pdf") {
                    adjustPdfScale();
                  }
                });

                $scope.$on('onPdfPageChange', function (event, params) {
                    setCurrentCanvasHeight(parseInt($('#annotationZone').height()));

                    $rootScope.currCanWidth = $('#annotationZone').width();

                    $rootScope.currCanHeight = $('#annotationZone').height();

                    $rootScope.$broadcast("pdfScaleChanged", [$rootScope.currCanWidth, $rootScope.currCanHeight]);
                });



                // onload
                $scope.$watch('totalPage', function(newVal, oldVal){
                    if(oldVal !== newVal){
                        $scope.changePageNumberBasedOnUrl();
                    }
                });

                $scope.$on('$routeUpdate', function(next, current){
                    if(!$location.search().slidePage) {
                        if(current.params.tab && current.params.tab == 'pdf')
                            $scope.setHistoryStack($scope.currentPageNumber);
                    } else {
                        var sp = parseInt($location.search().slidePage);
                        if(sp > 0 && sp != $scope.currentPageNumber && sp <= $scope.totalPage){
                            $scope.changePageNumberBasedOnUrl();
                        }
                    }
                });
            }
        };
    });
;/*
 takenfrom:http://blog.brunoscopelliti.com/
 */
app.directive('pwCheck', [function () {
    return {
        require: "ngModel",
        scope: {
            original: "="
        },
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;

            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                });
            });
        }
    };
}]);;app.directive('simplecolorpicker', function() {
  return {
    restrict: 'A',
    require: 'ngModel',

    link: function(scope, element, attrs, ngModel) {
      var colorPicker = null;
      var initialSelectedColor = null;

      function selectColor(color) {
        initialSelectedColor = null;
        element.val(color);
        element.simplecolorpicker('selectColor', element.val());
      }

      // HACK Wait for the AngularJS expressions inside element to be compiled
      setTimeout(function() {
        colorPicker = element.simplecolorpicker();
        if (initialSelectedColor !== null) {
          // Initializes the colorpicker with a color if one exists
          selectColor(initialSelectedColor);
        }

        // View -> model
        colorPicker.on('change', function() {
          scope.$apply(function() {
            ngModel.$setViewValue(element.val());
          });
        });
      }, 0); // Works with no delay

      // Model -> view
      ngModel.$render = function() {
        if (colorPicker !== null) {
          selectColor(ngModel.$viewValue);
        } else {
          initialSelectedColor = ngModel.$viewValue;
        }
      };

      // Cleanup
      element.on('$destroy', function() {
        if (colorPicker !== null) {
          element.simplecolorpicker('destroy');
        }
      });

    }
  };
});
;function Spinner($timeout) {
    return {
        restrict: 'E',
        template: '<i class="fa fa-cog fa-spin"></i>',
        scope: {
            show: '=',
            delay: '@'
        },
        link: function(scope, elem, attrs) {
            var showTimer;

            //This is where all the magic happens!
            // Whenever the scope variable updates we simply
            // show if it evaluates to 'true' and hide if 'false'
            scope.$watch('show', function(newVal){
                newVal ? showSpinner() : hideSpinner();
            });

            function showSpinner() {
                //If showing is already in progress just wait
                if (showTimer) return;

                //Set up a timeout based on our configured delay to show
                // the element (our spinner)
                showTimer = $timeout(showElement.bind(this, true), getDelay());
            }

            function hideSpinner() {
                //This is important. If the timer is in progress
                // we need to cancel it to ensure everything stays
                // in sync.
                if (showTimer) {
                    $timeout.cancel(showTimer);
                }

                showTimer = null;

                showElement(false);
            }

            function showElement(show) {
                show ? elem.css({display:''}) : elem.css({display:'none'});
            }

            function getDelay() {
                var delay = parseInt(scope.delay);

                return isNaN(delay) ? 200 : delay;
            }
        }
    };
}

app.directive('spinner', Spinner);
;/*jslint node: true */
'use strict';

app.directive('timepicker', function($timeout) {
    function msToTime(s) {
        function addZ(n) {
            return (n < 10 ? '0' : '') + n;
        }

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs);
    }

    function timeToMs(time) {
        var a = time.split(':'); // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
        return seconds * 1000;
    }

    return {
        restrict: 'EA',
        template: '<div class="input-group bootstrap-timepicker timepicker">' +
            '<input id="timepicker2" type="text" class="form-control input-small"></div>',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            var tp = element.find('input');
            var value = parseInt(scope.$eval(attrs.ngModel));

            tp.timepicker({
                minuteStep: 1,
                template: 'modal',
                secondStep: 1,
                appendWidgetTo: 'body',
                showSeconds: true,
                showMeridian: false,
                defaultTime: false
            });

            tp.timepicker('setTime', msToTime(value));

            tp.on('changeTime.timepicker', function(e) {
                var time = timeToMs(e.time.value);
                ngModel.$setViewValue(time);
                ngModel.$render();
                $timeout(function() {
                    scope.$apply();
                });
            });

            scope.$on('$destroy', function() {
                element.off('**');
            });
        }
    };
});
;app.directive('voting',
    function () {
        return {
            restrict: 'E',

            scope: {
                voteType: '@',
                voteTypeId: '@',
                voteValue: '@',
                voteTotal: '@',
                voteDisplay: '@'
            },
            template: '<div class="voting">' +
            '<a class="cursor" ng-click="sendVote(\'up\')"><div class="btn-up" ng-class="getClassUp()">' +
            '<i class="ionicons ion-ios-arrow-up" ng-hide="(voteValue == 1)"></i>' +
            '<i class="ionicons ion-arrow-up-b" ng-show="(voteValue == 1)"></i>' +
            '</div></a>' +
            '<div class="vote-total">{{voteDisplay}}</div>' +
            '<a class="cursor"><div class="btn-down" ng-class="getClassDown()" ng-click="sendVote(\'down\')">' +
            '<i class="ionicons ion-ios-arrow-down" ng-hide="(voteValue == -1)"></i>' +
            '<i class="ionicons ion-arrow-down-b" ng-show="(voteValue == -1)"></i>' +
            '</div></a>' +
            '</div>',

            controller: function ($scope, $compile, $http, $attrs, toastr) {
                $scope.errors = [];

                if($attrs.voteTotal)
                    $scope.voteDisplay = $attrs.voteTotal;
                else
                    $scope.voteDisplay = 0;

                $scope.$watchGroup(['voteType', 'voteTypeId'], function () {
                    if ($scope.voteType != null && $scope.voteTypeId != "" && $scope.voteTotal == null) {
                        $scope.getVoteTotal();
                    }
                });

                $scope.getVoteTotal = function () {
                    $scope.isLoading = true;
                    $http.get('/api/votes/' + $scope.voteType + '/id/' + $scope.voteTypeId)
                        .success(function(data){
                            if(data.result && data.vote.length > 0){
                                $scope.voteTotal = data.vote[0].total;
                                $scope.voteDisplay = data.vote[0].total;

                                if(data.vote[0].isVotingObject){
                                    $scope.voteValue = data.vote[0].isVotingObject.voteValue;
                                    if($scope.voteValue == 1)
                                        $scope.voteTotal -= 1;
                                    else if($scope.voteValue == -1)
                                        $scope.voteTotal += 1;

                                    $scope.voteDisplay = $scope.voteTotal + $scope.voteValue;
                                }
                            }
                            $scope.isLoading = false;
                        })
                        .error(function(data){
                            $scope.errors = data.errors;
                            $scope.isLoading = false;
                        });
                };

                $scope.getClassUp = function () {
                    // this person is voting up this content
                    if ($scope.voteValue == 1) {
                        return 'voted';
                    }
                };

                $scope.getClassDown = function () {
                    // this person is voting up this content
                    if ($scope.voteValue == -1) {
                        return 'voted';
                    }
                };

                $scope.sendVote = function (val) {
                    $scope.isLoading = true;

                    if (($scope.voteValue == 1 && val == 'up') || ($scope.voteValue == -1 && val == 'down')) {
                        val = 'reset';
                    }

                    $http({
                        method: 'POST',
                        url: '/api/votes/' + $scope.voteType + '/id/' + $scope.voteTypeId + '/' + val,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })
                        .success(function (data) {
                            if (data.result) {
                                if (val == 'up') { 
                                    $scope.voteValue = 1;

                                } else if (val == 'down') {
                                    $scope.voteValue = -1;

                                } else {
                                    $scope.voteValue = 0;
                                }

                                if(typeof($scope.voteTotal) == 'undefined')
                                    $scope.voteTotal = 0;

                                if(val == 'reset'){
                                    toastr.success('Vote Removed');
                                }
                                else {
                                    toastr.success('Successfully Voted');
                                }

                                $scope.voteDisplay = $scope.voteTotal + $scope.voteValue;
                            }

                            $scope.isLoading = false;
                        })
                        .error(function (data) {
                            $scope.isLoading = false;
                            $scope.errors = data.errors;

                            toastr.error('Voting Failed');
                        });
                };
            }

        };
    });;app.controller('DiscussionController', function ($scope, $rootScope, $http, $location, $sce,
                                                 $compile, ActionBarService, courseService,
                                                 discussionService, $timeout,
                                                 toastr, Page, $window) {
    $scope.formData = {
        content: ''
    };

    $scope.pageTitleOnDiscussion = "";
    $scope.course = null;
    $scope.currentReplyingTo = false;
    $scope.currentEditPost = {};
    $scope.currentTopic = false;
    $scope.originalCurrentTopic = {};
    $scope.pid = false;
    $scope.isLoading = false;
    $scope.errors = [];
    $scope.topics = [];
    $scope.topicsLength = 0;
    $scope.replies = [];

    $scope.newRowsFetched = function (newRows, allRows) {
        if (newRows) {
            $scope.topics = allRows;
            $scope.topicsLength = $scope.topics.length;
        }
    };

    $scope.initiateTopic = function () {
        $scope.pid = $location.search().pid;

        if ($scope.pid) {
            $scope.getReplies($scope.pid);
            $scope.manageBreadCrumb();
        }

        $scope.manageActionBar();
    };

    $scope.manageBreadCrumb = function () {
        var dt = $('.action-header .breadcrumb').find('li.discussionTitle');
        $('.action-header .breadcrumb li').removeClass('active');
        var u = '#/cid/' + $scope.course._id + '?tab=discussion';
        if (dt.length > 0) {
            dt.html($scope.currentTopic.title);
        } else {
            if ($scope.pid) {
                $('.action-header .breadcrumb').find('li.tab').wrapInner('<a class="discussionTabLink" href="' + u + '"></a>');
                var newEl = '<li class="discussionTitle active">' + $scope.currentTopic.title + '</li>';
                $('.action-header .breadcrumb').append(newEl);
            }
        }
    };

    $scope.saveNewPost = function (isValid) {
        if (!isValid)
            return;

        $scope.isLoading = true;
        var d = transformRequest($scope.formData);
        $http({
            method: 'POST',
            url: '/api/discussions/' + $scope.course._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {
                if (data.result) {
                    $scope.$emit('onAfterCreateNewTopic', data.post);
                    $scope.topics.unshift(data.post);
                    $timeout(function () {
                        $scope.$apply()
                    });

                    $('#addNewTopicModal').modal('hide');

                    toastr.success('Successfully Saved');
                }

                $scope.addTopicForm.$setPristine();
                $scope.isLoading = false;
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.isLoading = false;

                toastr.error('Saving Failed');
            });
    };

    $scope.saveEditPost = function (isValid) {
        if (!isValid)
            return;

        var d = transformRequest($scope.currentTopic);
        $http({
            method: 'PUT',
            url: '/api/discussion/' + $scope.currentTopic._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {
                if (data.result) {
                    $scope.$emit('onAfterEditTopic', data.post);

                    $('#editTopicModal').modal('hide');

                    var i = _.findIndex($scope.topics, {'_id': data.post._id});
                    $scope.topics[i] = data.post;
                    $timeout(function () {
                        $scope.$apply()
                    });

                    $scope.editTopicForm.$setPristine();
                    $scope.isLoading = false;

                    toastr.success('Successfully Saved');
                }
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.isLoading = false;

                toastr.error('Saving Failed');
            });
    };

    $scope.editReply = function (re) {
        $('#editReplyModal').modal('show');

        $scope.currentEditPost = re;
        $scope.$broadcast('onEditReplyClicked', re);
    };

    $scope.deletePost = function (postId) {
        $http({
            method: 'DELETE',
            url: '/api/discussion/' + postId,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {

                if (data.result) {
                    $scope.$emit('onAfterDeletePost', postId);

                    toastr.success('Successfully Deleted');

                }
            })

            .error(function (data) {
                $scope.errors = data.errors;
                $scope.isLoading = false;

                toastr.error('Delete Failed');
            });
    };

    $scope.deleteTopic = function (postId) {
        var r = confirm("Are you sure you want to delete this topic?");

        if (r == true) {
            $http({
                method: 'DELETE',
                url: '/api/discussions/' + $scope.course._id + '/topic/' + postId,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {

                    if (data.result) {
                        $scope.$emit('onAfterDeleteTopic', postId);

                        toastr.success('Successfully Deleted');
                    }
                })

                .error(function (data) {
                    $scope.errors = data.errors;
                    $scope.isLoading = false;

                    toastr.error('Delete Failed');
                });
        }
    };

    $scope.manageActionBar = function () {
        if ($scope.$parent.currentTab != 'discussion')
            return;

        if ($scope.pid) {
            ActionBarService.extraActionsMenu = [];

            ActionBarService.extraActionsMenu.push({
                separator: true
            });

            ActionBarService.extraActionsMenu.push(
                {
                    'html': '<a style="cursor: pointer;"' +
                    ' data-toggle="modal" data-target="#addNewReplyModal"' +
                    ' title="Reply">' +
                    '&nbsp;&nbsp; <i class="ionicons ion-reply"></i> &nbsp; REPLY</a>'
                }
            );

            if ($scope.currentTopic && $scope.currentTopic.createdBy &&
                ($scope.isAdmin || $scope.isManager ||
                $scope.isOwner || $scope.currentTopic.createdBy._id == $rootScope.user._id)
            ) {

                ActionBarService.extraActionsMenu.push({
                    'html': '<a style="cursor: pointer;"' +
                    ' data-toggle="modal" data-target="#editTopicModal"' +
                    ' title="Edit">' +
                    '&nbsp;&nbsp; <i class="ionicons ion-edit"></i> &nbsp; EDIT</a>'
                });

                ActionBarService.extraActionsMenu.push({
                    clickAction: $scope.deleteTopic,
                    clickParams: $scope.currentTopic._id,
                    title: '<i class="ionicons ion-close"></i> &nbsp;DELETE',
                    aTitle: 'DELETE THIS TOPIC AND ITS REPLIES'
                });
            }

        }
        else if (!$scope.pid) {
            $scope.currentTopic = {};
            ActionBarService.extraActionsMenu = [];
        }
    };

    $scope.getReplies = function (postId) {
        var i = _.findIndex($scope.topics, {'_id': postId});
        if ($scope.topics[i]) {
            $scope.currentTopic = cloneSimpleObject($scope.topics[i]);

            Page.setTitle($scope.pageTitleOnDiscussion + ' > ' + $scope.currentTopic.title);

            $scope.currentTopic.createdBy = $scope.topics[i].createdBy;

            $scope.originalCurrentTopic = cloneSimpleObject($scope.topics[i]);

            $scope.currentReplyingTo = $scope.currentTopic._id;

            $http.get('/api/discussion/' + postId + '/posts').success(function (res) {
                if (res.result) {
                    $scope.replies = res.posts;
                }
            });
        }
    };

    $scope.cancel = function () {
        $scope.currentTopic = $scope.originalCurrentTopic;
        $scope.editTopicForm.$setPristine();
        $scope.addTopicForm.$setPristine();
        $scope.errors = [];
    };

    $scope.initTab = function (courseId) {
        discussionService.init(courseId,

            function (posts) {
                $scope.topics = posts;
                $scope.topicsLength = $scope.topics.length;
                $scope.pageTitleOnDiscussion = Page.title();
                $scope.initiateTopic();
            },

            function (errors) {
                toastr.error(errors);
            }
        );
    };

    $scope.tabOpened = function () {

        if (courseService.course) {
            $scope.course = courseService.course;

            if (discussionService.posts) {
                $scope.posts = discussionService.posts;
            }

            $scope.initTab(courseService.course._id);
        } else {
            $scope.$on('onAfterInitCourse', function (e, course) {
                $scope.course = course;
                $scope.initTab(course._id);
            });
        }

        $rootScope.$broadcast('onCoursePreviewTabOpened', $scope.currentTab);
    };

    $scope.$on('$routeUpdate', function () {
        $scope.initiateTopic();

        if (!$scope.pid) {
            $('li.discussionTitle').remove();
            var te = $('a.discussionTabLink').text();
            $('.action-header .breadcrumb li.tab').html(te);
        }
    });

    $scope.$on('onAfterCreateNewTopic', function (e, f) {
        $scope.formData.title = "";
        $scope.formData.content = "";
    });

    $scope.$on('onAfterEditReply', function (e, f) {
        var i = _.findIndex($scope.replies, {'_id': f._id});
        $scope.replies[i].content = f.content;
        $timeout(function () {
            $scope.$apply();
        });
    });

    $scope.$on('onAfterDeletePost', function (e, postId) {
        var i = _.findIndex($scope.replies, {'_id': postId});
        $scope.replies[i].content = '[DELETED]';
        $timeout(function () {
            $scope.$apply();
        });
    });

    $scope.$on('onAfterDeleteTopic', function (e, postId) {
        var i = _.findIndex($scope.topics, {'_id': postId});
        //$scope.topics[i].isDeleted = true;
        if (i >= 0) {
            $scope.topics.splice(i, 1);
            $scope.currentTopic = false;
            $scope.replies = [];
            $scope.pid = false;
            $location.search('pid', '');
            $scope.initiateTopic();

            $timeout(function () {
                $scope.$apply();
            });
        }
    });

    $scope.$on('onAfterCreateReply', function (e, reply) {
        if (reply) {
            reply.createdBy = $rootScope.user;
            $scope.replies.unshift(reply);
        }
    });

    /**
     * watch for different window size
     */
    $scope.wSize = 'lg';
    $scope.$watch(function () {
        return $window.innerWidth;
    }, function (value) {
        $scope.wSize = Page.defineDevSize(value);
    });

    $scope.tabOpened();
});;app.controller('ReplyController', function ($scope, $http, $timeout, toastr) {
    $scope.isLoading = false;
    $scope.errors = [];

    $scope.EditFormData = {
        title: " ",
        content: ""
    };

    $scope.AddFormData = {
        title: " ",
        content: ""
    };

    $scope.$on('onEditReplyClicked', function (e, post) {
        $scope.EditFormData.content = post.content;
        $scope.EditFormData.postId = post._id;
    });

    $scope.saveNewReply = function (isValid) {
        if (!isValid)
            return;

        $scope.AddFormData.parentPost = $scope.$parent.currentReplyingTo;

        $scope.isLoading = true;

        var d = transformRequest($scope.AddFormData);
        $http({
            method: 'POST',
            url: '/api/discussion/replies/',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {
                console.log(data);
                if (data.result) {
                    $scope.$emit('onAfterCreateReply', data.post);

                    $('#addNewReplyModal').modal('hide');

                    $scope.AddFormData.content = "";

                    $timeout(function () {
                        $scope.$apply()
                    });

                    $scope.addNewReplyForm.$setPristine();
                    $scope.isLoading = false;
                    $scope.errors = [];

                    toastr.success('Successfully Saved');
                }
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.isLoading = false;
                toastr.error('Saving Failed');
            });
    };

    $scope.cancel = function () {
        $scope.EditFormData.content = "";
        $scope.AddFormData.content = "";
        if ($scope.addNewReplyForm)
            $scope.addNewReplyForm.$setPristine();

        if ($scope.editReplyForm)
            $scope.editReplyForm.$setPristine();

        $scope.errors = [];
    };

    $scope.saveEditReply = function (isValid) {
        if (!isValid)
            return;

        $scope.isLoading = true;

        var d = transformRequest($scope.EditFormData);
        $http({
            method: 'PUT',
            url: '/api/discussion/' + $scope.$parent.currentEditPost._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {

                if (data.result) {
                    $scope.$emit('onAfterEditReply', data.post);

                    $scope.EditFormData.content = "";
                    $timeout(function () {
                        $scope.$apply()
                    });

                    $('#editReplyModal').modal('hide');

                    toastr.success('Successfully Saved');
                }

                $scope.editReplyForm.$setPristine();
                $scope.isLoading = false;
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.isLoading = false;

                toastr.error('Saving Failed');
            });
    };

    /**
     * deleting root topic
     * @param postId
     */
    $scope.deletePost = function (postId) {
        $http({
            method: 'DELETE',
            url: '/api/discussion/' + postId,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {

                if (data.result) {
                    $scope.$emit('onAfterDeletePost', postId);

                    toastr.success('Successfully Deleted');
                }
            })
            .error(function(data){
                $scope.errors = data.errors;
                toastr.error('Delete Failed');
            });
    };

});;app.factory('authService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            user: null,

            isCheckingForLogin: false,

            /**
             * default value is null  because its used on a watch check
             *
             * if you want to use isLogged, you have to be sure that it already tried to login, or called loginCheck
             * otherwise just use loginCheck
             */
            isLoggedIn: false,
            hasTriedToLogin: false,

            loginCheck: function (successCallback, errorCallback) {
                var self = this;

                if (self.user) {
                    self.isLoggedIn = true;
                    successCallback(self.user);
                }
                else {
                    if (self.isCheckingForLogin)
                        return;

                    self.isCheckingForLogin = true;

                    $http.get('/api/accounts').success(function (data) {
                        self.isCheckingForLogin = false;

                        self.hasTriedToLogin = true;

                        if (data.result) {
                            self.user = data.user;
                            self.isLoggedIn = true;
                            $rootScope.user = data.user;

                            $rootScope.$broadcast('onAfterInitUser', self.user);
                            successCallback(self.user);
                        }
                    }).error(function (data) {
                        self.isCheckingForLogin = false;
                        self.isLoggedIn = false;
                        self.hasTriedToLogin = true;

                        if (errorCallback)
                            errorCallback(data);
                    });
                }
            },

            isAdmin: function () {
                if (this.user && this.user.role == 'admin')
                    return true;

                return false;
            },

            login: function (loginData, successCallback, errorCallback) {
                var self = this;

                var d = transformRequest(loginData);
                $http({
                    method: 'POST',
                    url: '/api/accounts/login',
                    data: d,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                    .success(
                        function success(data) {
                            if (data.result) {
                                /*$rootScope.user = data.user;
                                 self.user = data.user;
                                 self.isLoggedIn = true;
                                 $rootScope.$broadcast('onAfterInitUser', $rootScope.user);
                                 successCallback($rootScope.user);*/

                                window.location.reload();
                            }
                        })
                    .error(
                        function (data) {
                            self.isLoggedIn = false;
                            errorCallback(data);
                        });
            },

            signUp: function (loginData, successCallback, errorCallback) {
                var d = transformRequest(loginData);
                $http({
                    method: 'POST',
                    url: '/api/accounts/signUp',
                    data: d,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                    .success(
                        function success(data) {
                            if (data.result) {
                                //$rootScope.user = data.user;
                                $rootScope.$broadcast('onAfterUserRegistration', data.user);

                                successCallback(data.user);
                            } else {
                                errorCallback(data);
                            }
                        }).error(
                    function (data) {
                        errorCallback(data);
                    }
                );
            }
        }
    }
]);;app.factory('courseService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            course: null,

            init: function (courseId, success, error, force) {
                var self = this;

                if (!force && self.course) {
                    if (success)
                        success(self.course);
                }
                else if (force || !self.course)
                    $http.get('/api/course/' + courseId)
                        .success(function (res) {
                            if (res.result) {
                                self.course = res.course;

                                if (success)
                                    success(res.course);
                            }
                        })
                        .error(function (res) {
                            if (error)
                                error(res);
                        });
            },

            isEnrolled: function () {
                if (!this.isInitialized()) return false;

                return this.course.isEnrolled;
            },

            isOwner: function (user) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                return (user._id == self.course.createdBy._id);
            },

            isManager: function (user) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                var mgr = _.find(self.course.managers, {_id: user._id});

                if (mgr) {
                    return true;
                }

                return false;
            },

            leave: function (user, success, error) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                var url = '/api/course/' + self.course._id + '/leave';

                $http.put(url, {})
                    .success(function (res) {
                        if (res.result) {
                            // success leaving
                            self.course.isEnrolled = false;
                        }

                        if (success)
                            success(self.course.isEnrolled);
                    })
                    .error(function (res) {
                        if (error)
                            error(res);
                    });
            },

            enroll: function (user, success, error) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                var url = '/api/course/' + self.course._id + '/enroll';

                $http.put(url, {})
                    .success(function (res) {
                        if (res.result)
                            self.course.isEnrolled = true;

                        if (success)
                            success(self.course.isEnrolled);
                    })
                    .error(function (res) {
                        if (error)
                            error(res);
                    });
            },

            isInitialized: function () {
                if (!this.course) {
                    return false;
                }

                return true;
            }
        }
    }
]);;app.factory('discussionService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            posts: null,
            pageUrl: '',
            courseId: null,

            pageParams: {
                limit: 10,
                sortBy: '_id',
                orderBy: 'desc',
                lastPage: false
            },

            init: function (courseId, success, error, force) {
                var self = this;

                self.courseId = courseId;
                self.setPageUrl();

                if (!force && self.posts) {
                    if (success)
                        success(self.posts);
                }

                else if (force || !self.posts)
                    $http.get('/api/discussions/' + courseId + self.pageUrl)
                        .success(function (data) {
                            if (data.result && data.posts) {
                                self.posts = data.posts;
                                if (success)
                                    success(self.posts);
                            }
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },

            getMoreRows: function (success, error) {
                var self = this;

                self.setPageUrl();
                $http.get('/api/discussions/' + self.courseId + self.pageUrl)
                    .success(function (data) {
                        if (data.result && data.posts && data.posts.length > 0) {
                            self.posts = self.posts.concat(data.posts);

                            if (success)
                                success(data.posts, self.posts);
                        }
                        else
                            success(false);
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            setPageUrl: function () {
                this.pageUrl = '?';

                var ps = [];
                for (var k in this.pageParams) {
                    ps.push(k + '=' + this.pageParams[k]);
                }

                this.pageUrl += ps.join('&');
            },

            setPageParams: function (scp) {
                var self = this;

                self.pageParams.limit = scp.limit;
                self.pageParams.sortBy = scp.sortBy;
                self.pageParams.orderBy = scp.orderBy;
                self.pageParams.lastPage = scp.lastPage;
            },

            isInitialized: function () {
                if (!this.posts) {
                    return false;
                }

                return true;
            }
        }
    }
]);;app.factory('linkService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            posts: null,
            nodeId: null,

            pageParams: {
                limit: 10,
                sortBy: '_id',
                orderBy: 'desc',
                lastPage: false
            },

            getMoreRows: function (success, error) {
                var self = this;

                self.setPageUrl();
                $http.get('/api/links/' + self.nodeId + self.pageUrl)
                    .success(function (data) {
                        if (data.result && data.posts && data.posts.length > 0) {
                            self.posts = self.posts.concat(data.posts);

                            if (success)
                                success(data.posts, self.posts);
                        }
                        else
                            success(false);
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            setPageUrl: function () {
                this.pageUrl = '?';

                var ps = [];
                for (var k in this.pageParams) {
                    ps.push(k + '=' + this.pageParams[k]);
                }

                this.pageUrl += ps.join('&');
            },

            setPageParams: function (scp) {
                var self = this;

                self.pageParams.limit = scp.limit;
                self.pageParams.sortBy = scp.sortBy;
                self.pageParams.orderBy = scp.orderBy;
                self.pageParams.lastPage = scp.lastPage;
            },

            init: function (nodeId, success, error, force) {
                var self = this;

                self.nodeId = nodeId;

                if (!force && self.posts) {
                    if (success)
                        success(self.posts);
                }

                else if (force || !self.posts)
                    $http.get('/api/links/' + nodeId)
                        .success(function (data) {
                            if (data.result && data.posts) {
                                self.posts = data.posts;
                                if (success)
                                    success(self.posts);
                            }
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },

            isInitialized: function () {
                if (!this.posts) {
                    return false;
                }

                return true;
            }
        }
    }
]);;app.factory('mapService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            treeNodes: null,

            init: function (courseId, success, error, force) {
                var self = this;

                if (!force && self.treeNodes) {
                    if (success)
                        success(self.treeNodes);
                }

                else if (force || !self.treeNodes)
                    $http.get('/api/treeNodes/course/' + courseId)
                        .success(function (data) {
                            if (data.result) {
                                self.treeNodes = data.treeNodes;
                                if (success)
                                    success(self.treeNodes);
                            }
                        })

                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },


            isInitialized: function () {
                if (!this.treeNodes) {
                    return false;
                }

                return true;
            }
        }
    }
]);;app.factory('Page', function($window) {
    var prefix = 'CourseMapper';
    var title = 'CourseMapper';
    return {
        title: function() {
            return title;
        },

        setTitle: function(newTitle) {
            title = newTitle;
            $window.document.title = title;
        },

        setTitleWithPrefix: function(newTitle) {
            title = prefix + ': ' + newTitle;
            $window.document.title = title;
        },

        xs: 768,
        sm: 992,
        md: 1200,

        defineDevSize: function(width){
            if(width < this.xs){
                return 'xs';
            } else if(width > this.xs && width <= this.sm){
                return 'sm';
            } else if(width > this.sm && width <= this.md){
                return 'md';
            } else if(width > this.md){
                return 'lg';
            }
        }
    };
});;/*jslint node: true */
'use strict';

app.factory('socket', function($rootScope) {
    var socket = io.connect();

    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});
;app.factory('treeNodeService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            treeNode: null,
            pdfFile: null,
            videoFile: null,

            init: function (nodeId, success, error, force) {
                var self = this;

                if (!force && self.treeNode) {
                    if (success)
                        success(self.treeNode);
                }
                else if (force || !self.treeNode) {
                    $http.get('/api/treeNode/' + nodeId)
                        .success(function (res) {
                            if (res.result) {
                                self.treeNode = res.treeNode;
                                self.parseResources();

                                if (success)
                                    success(res.treeNode);
                            }
                        })
                        .error(function (res) {
                            if (error)
                                error(res);
                        });
                }
            },

            parseResources: function () {
                var self = this;
                for (var i = 0; i < self.treeNode.resources.length; i++) {
                    var content = self.treeNode.resources[i];
                    if (content['type'] == 'mp4'
                        || content['type'] == 'video'
                        || content['type'] == 'videoLink'
                    ) {
                        self.videoFile = content;
                        self.treeNode.videoFile = content;
                    } else if (content['type'] == 'pdf'
                        || content['type'] == 'pdfLink'
                    ) {
                        self.pdfFile = content;
                        self.treeNode.pdfFile = content;
                    }
                }
            },

            isOwner: function (user) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                return (user._id == self.treeNode.createdBy._id);
            },

            isInitialized: function () {
                if (!this.treeNode) {
                    return false;
                }

                return true;
            }
        }
    }
]);;app.factory('widgetService', [
    '$http', '$rootScope', '$ocLazyLoad', '$timeout',

    function (  $http, $rootScope, $ocLazyLoad, $timeout) {
        return {
            widgets: [],
            uninstalledwidgets: [],
            installedWidgets: [],

            getWidgetsOnLocation: function (location, id, success, error, force) {
                var self = this;

                if (!force && self.installedWidgets[location]) {
                    self.initializeWidgets(self.installedWidgets[location], location, function( ){
                        if (success) {
                            success(self.widgets[location]);
                        }
                    });
                }

                else if (force || !self.widgets[location])
                    $http.get('/api/widgets/' + location + '/' + id)
                        .success(function (data) {
                            self.installedWidgets[location] = [];

                            if(data.result){
                                self.installedWidgets[location] = data.widgets;

                                self.initializeWidgets(data.widgets, location, function( ){
                                    if (success) {
                                        success(self.widgets[location]);
                                    }
                                });
                            } else
                                if (error)
                                    error(data.errors);
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },

            lazyLoad: function (wdg, currentIndex, widgetJsArray, fileToLoad, location) {
                var self = this;

                (function (wdg) {
                    var jsfn = '/' + wdg.application + '/' + fileToLoad;

                    $ocLazyLoad.load(jsfn).then(function () {
                        // the last one has been loaded
                        var l = wdg.widgetId.widgetJavascript.length - 1;
                        if (fileToLoad == wdg.widgetId.widgetJavascript[l]) {
                            // only push to main widgets array when it is the last js to load
                            self.widgets[location].push(wdg);
                        } else {
                            var nextFile = widgetJsArray[currentIndex++];
                            self.lazyLoad(wdg, currentIndex, widgetJsArray, nextFile);
                        }
                    });
                })(wdg);
            },

            initializeWidgets: function (widgets, location, finishedCB) {
                var self = this;

                self.widgets[location] = [];

                for (var i in widgets) {
                    var wdg = widgets[i];

                    // loop to load the js (if exist)
                    if (wdg.widgetId.widgetJavascript) {
                        this.lazyLoad(wdg, 0, wdg.widgetId.widgetJavascript, wdg.widgetId.widgetJavascript[0], location);
                    } else {
                        self.widgets[location].push(wdg);
                    }
                }

                if(finishedCB)
                    finishedCB(self.widgets[location]);
            },

            isInitialized: function (location) {
                if (!this.widgets[location]) {
                    return false;
                }

                return true;
            },

            addWidget: function (location, id) {
                var self = this;

                var loc = '#' + location + '-widgets';
                var grid = $(loc).data('gridstack');

                var el = '#w' + id;

                // get width and height
                var i = _.findIndex(self.widgets[location], {'widgetId': {'_id': id}});
                var wdg = self.widgets[location][i];

                //add_widget(el, x, y, width, height, auto_position)
                var x = 0;
                var y = 0;
                if (wdg.position) {
                    x = wdg.position.x;
                    y = wdg.position.y;
                }

                grid.add_widget(el, x, y, wdg.width, wdg.height, false);
            },

            initWidgetButton: function (location, id) {
                $.AdminLTE.boxWidget.activate();
                this.addWidget(location, id);

                var h = $('#w' + id + ' .grid-stack-item-content');
                $('#w' + id + ' .grid-stack-item-content .box-body').css('height', (h.innerHeight() - 40) + 'px');
            },

            install: function (location, application, name, extraParams, successCb, errorCb) {
                var params = {
                    application: application,
                    widget: name,
                    location: location
                };

                params = _.merge(params, extraParams);

                $http.put('/api/widgets/install', params)
                    .success(function (data) {
                        if (data.result) {
                            if (successCb)
                                successCb(data.installed);
                        } else
                            if (errorCb)
                                errorCb(data.errors);
                    })
                    .error(function (data) {
                        if (errorCb)
                            errorCb(data.errors);
                    });
            },

            uninstall: function (installId, extraParams, successCb, errorCb) {
                var self = this;

                $http.put('/api/widgets/uninstall/' + installId, extraParams)
                    .success(function (data) {
                        if (data.result) {
                             self.uninstalledwidgets.push(installId);

                            if (successCb)
                                successCb(data.uninstalled);
                        }
                        else
                            if (errorCb)
                                errorCb(data.errors);
                    })
                    .error(function (data) {
                        if (errorCb)
                            errorCb(data.errors);
                    });
            },

            setPosition: function (wId, x, y, success, error) {
                $http.put('/api/widget/' + wId + '/setPosition', {
                        x: x, y: y
                    })
                    .success(function (res) {
                        if (success)
                            success(res);
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            initiateDraggableGrid: function (locs, enableDragging) {
                var self = this;

                var loc = '#' + locs + '-widgets';

                var options = {
                    cell_height: 340,
                    vertical_margin: 10,
                    resizable: false
                };

                if(!enableDragging){
                    options.draggable = {'disabled': true};
                }

                var curNode = {x: 0, y: 0};

                var $gs = $(loc);
                $gs.gridstack(options);

                if(enableDragging){
                    $gs.on('onStartMove', function (e, node) {
                        curNode.x = node.x;
                        curNode.y = node.y;
                    });

                    $gs.on('onMove', function (e, node) {

                    });

                    $gs.on('onFinishDrop', function (e, node) {
                        var o = $(node.el);

                        if (options.allowed_grids && options.allowed_grids.indexOf(node.x) < 0) {
                            o.attr('data-gs-x', curNode.x).attr('data-gs-y', curNode.y);
                        }

                        var wId = o.attr('id').substr(1);
                        self.setPosition(wId, node.x, node.y);
                    });
                }
            }
        }
    }
]);;app.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

app.filter('base64Encode', function() {
    return function(input, all) {
        return (!!input) ? Base64.encode(input) : '';
    }
});

app.filter('base64Decode', function() {
    return function(input, all) {
        return (!!input) ? Base64.decode(input) : '';
    }
});

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });;app.filter('msToTime', function() {
    return function msToTime(s) {
        function addZ(n) {
            return (n < 10 ? '0' : '') + n;
        }

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs);
    };
});
;(function(){"use strict";angular.module("relativeDate",[]).value("now",null).value("relativeDateTranslations",{just_now:"just now",seconds_ago:"{{time}} seconds ago",a_minute_ago:"a minute ago",minutes_ago:"{{time}} minutes ago",an_hour_ago:"an hour ago",hours_ago:"{{time}} hours ago",a_day_ago:"yesterday",days_ago:"{{time}} days ago",a_week_ago:"a week ago",weeks_ago:"{{time}} weeks ago",a_month_ago:"a month ago",months_ago:"{{time}} months ago",a_year_ago:"a year ago",years_ago:"{{time}} years ago",over_a_year_ago:"over a year ago",seconds_from_now:"{{time}} seconds from now",a_minute_from_now:"a minute from now",minutes_from_now:"{{time}} minutes from now",an_hour_from_now:"an hour from now",hours_from_now:"{{time}} hours from now",a_day_from_now:"tomorrow",days_from_now:"{{time}} days from now",a_week_from_now:"a week from now",weeks_from_now:"{{time}} weeks from now",a_month_from_now:"a month from now",months_from_now:"{{time}} months from now",a_year_from_now:"a year from now",years_from_now:"{{time}} years from now",over_a_year_from_now:"over a year from now"}).filter("relativeDate",["$injector","now","relativeDateTranslations",function(a,b,c){var d,e;return d=a.has("$translate")?a.get("$translate"):{instant:function(a,b){return c[a].replace("{{time}}",b.time)}},e=function(a,b){return Math.round(Math.abs(a-b)/1e3)},function(a){var c,f,g,h,i,j,k,l,m;switch(j=b?b:new Date,a instanceof Date||(a=new Date(a)),f=null,h=60,g=60*h,c=24*g,l=7*c,i=30*c,m=365*c,f=e(j,a),f>c&&l>f&&(a=new Date(a.getFullYear(),a.getMonth(),a.getDate(),0,0,0),f=e(j,a)),k=function(b,c){var e;return e="just_now"===b?b:j>=a?""+b+"_ago":""+b+"_from_now",d.instant(e,{time:c})},!1){case!(30>f):return k("just_now");case!(h>f):return k("seconds",f);case!(2*h>f):return k("a_minute");case!(g>f):return k("minutes",Math.floor(f/h));case 1!==Math.floor(f/g):return k("an_hour");case!(c>f):return k("hours",Math.floor(f/g));case!(2*c>f):return k("a_day");case!(l>f):return k("days",Math.floor(f/c));case 1!==Math.floor(f/l):return k("a_week");case!(i>f):return k("weeks",Math.floor(f/l));case 1!==Math.floor(f/i):return k("a_month");case!(m>f):return k("months",Math.floor(f/i));case 1!==Math.floor(f/m):return k("a_year");default:return k("over_a_year")}}}])}).call(this);;app.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);
;app.
controller('LinksController', function ($scope, $rootScope, $http, $location,
                                        $sce, $compile, ActionBarService, $timeout,
                                        toastr, Page, $window, treeNodeService,
                                        authService, courseService, linkService) {
    $scope.formData = {};
    $scope.currentLink = false;
    $scope.originalCurrentLink = {};
    $scope.pid = false;
    $scope.currentLinkUrl = "";
    $scope.links = [];
    $scope.errors = [];
    $scope.isLoading = false;

    $scope.initiateLink = function (pid) {
        $scope.pid = pid;
        $location.search('pid', pid);

        $scope.manageActionBar();

        if ($scope.pid) {
            $scope.setCurrentLink($scope.pid)
        }
    };

    $scope.newRowsFetched = function (newRows, allRows) {
        if (newRows) {
            $scope.links = allRows;
        }
    };

    $scope.linksLength = function () {
        return $scope.links.length;
    };

    $scope.initTab = function (node) {
        linkService.init(node._id,

            function (posts) {
                $scope.links = posts;
                $scope.pageTitleOnLink = Page.title();
                $scope.initiateLink();
            },

            function (errors) {
                toastr.error(errors);
            }
        );
    };

    $scope.tabOpened = function () {
        if (treeNodeService.treeNode) {

            if (linkService.posts) {
                $scope.posts = linkService.posts;
            }

            $scope.initTab(treeNodeService.treeNode);
        } else {
            $scope.$on('onAfterInitTreeNode', function (e, contentNode) {
                $scope.initTab(contentNode);
            });
        }

        $scope.manageActionBar();
        $rootScope.$broadcast('onNodeLinkTabOpened', $scope.currentTab);
    };


    $scope.saveNewPost = function (isValid) {
        if (!isValid)
            return;

        $scope.isLoading = true;

        var d = transformRequest($scope.formData);
        $http({
            method: 'POST',
            url: '/api/links/' + $scope.treeNode._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {

                if (data.result) {
                    $scope.$emit('onAfterCreateNewLink', data.post);
                    $scope.links.unshift(data.post);
                    $timeout(function () {
                        $scope.$apply()
                    });

                    $scope.formData = {};
                    $scope.AddLinkForm.$setPristine();

                    $('#AddLinksModal').modal('hide');
                }

                toastr.success('Successfully Saved');
                $scope.isLoading = false;
            })
            .error(function (data) {
                $scope.isLoading = false;
                $scope.errors = data.errors;
                toastr.error('Saving Failed');
            });
    };

    $scope.saveEditPost = function (isValid) {
        if (!isValid)
            return;

        $scope.isLoading = true;

        var d = transformRequest($scope.currentLink);
        $http({
            method: 'PUT',
            url: '/api/links/' + $scope.currentLink._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function (data) {
                if (data.result) {
                    $scope.$emit('onAfterEditLinks', $scope.currentLink);

                    $('#EditLinksModal').modal('hide');

                    var i = _.findIndex($scope.links, {'_id': data.post._id});
                    $scope.links[i] = $scope.currentLink;
                    $timeout(function () {
                        $scope.$apply()
                    });

                    toastr.success('Successfully Saved');
                }

                $scope.AddLinkForm.$setPristine();
                $scope.isLoading = false;
            })
            .error(function (data) {
                $scope.isLoading = false;
                $scope.errors = data.errors;
                toastr.error('Saving Failed');
            });
    };

    $scope.deletePost = function (postId) {
        var r = confirm("Are you sure you want to delete this link?");

        if (r == true) {
            $http({
                method: 'DELETE',
                url: '/api/links/' + $scope.treeNode._id + '/link/' + postId,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    if (data.result) {
                        $scope.$emit('onAfterDeleteLink', postId);

                        toastr.success('Successfully Deleted');
                    }
                })
                .error(function (data) {
                    $scope.errors = data.errors;
                    toastr.error('Delete Failed');
                });
        }
    };

    $scope.manageActionBar = function () {
        if ($location.search().tab != 'links')
            return;

        if ($scope.pid) {
            ActionBarService.extraActionsMenu = [];
            ActionBarService.extraActionsMenu.unshift({
                separator: true
            });

            ActionBarService.extraActionsMenu.push({
                'html': '<a style="cursor: pointer;"' +
                ' data-toggle="modal" data-target="#EditLinksModal"' +
                ' title="Edit">' +
                '&nbsp;&nbsp; <i class="ionicons ion-edit"></i> &nbsp; EDIT</a>'
            });

            ActionBarService.extraActionsMenu.push({
                clickAction: $scope.deletePost,
                clickParams: $scope.pid,
                title: '<i class="ionicons ion-close"></i> &nbsp;DELETE',
                aTitle: 'DELETE'
            });
        }
        else if (!$scope.pid) {
            $scope.currentLink = {};
            ActionBarService.extraActionsMenu = [];
        }
    };

    $scope.setCurrentLink = function (postId) {
        var i = _.findIndex($scope.links, {'_id': postId});
        if ($scope.links[i]) {
            $scope.currentLink = cloneSimpleObject($scope.links[i]);
            $scope.currentLink.createdBy = $scope.links[i].createdBy;
            $scope.originalCurrentLink = cloneSimpleObject($scope.links[i]);
            $scope.currentLinkUrl = $sce.trustAsResourceUrl($scope.currentLink.content);
        }
    };

    $scope.cancel = function () {
        $scope.currentLink = $scope.originalCurrentLink;
        if ($scope.AddLinkForm)
            $scope.AddLinkForm.$setPristine();
        if ($scope.EditLinkForm)
            $scope.EditLinkForm.$setPristine();
    };

    $scope.getSrc = function (url) {
        return $sce.trustAsResourceUrl(url);
    };

    $scope.$on('onAfterDeleteLink', function (e, postId) {
        var i = _.findIndex($scope.links, {'_id': postId});
        if (i >= 0) {
            //$scope.links[i].isDeleted = true;
            $scope.links.splice(i, 1);
            $scope.currentLink = false;
            $scope.pid = false;
            $location.search('pid', '');
            $scope.initiateLink();

            $timeout(function () {
                $scope.$apply();
            });
        }
    });


    /**
     * watch for different window size
     */
    $scope.wSize = 'lg';
    $scope.$watch(function () {
        return $window.innerWidth;
    }, function (value) {
        $scope.wSize = Page.defineDevSize(value);
    });

    $scope.tabOpened();
});;app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout, $injector) {

    $scope.storedAnnZones = [];
    $scope.storedAnnZoneColors = [];
    $rootScope.tagNameErrors = {};
    //$rootScope.pdfId = "";

    $scope.tagNamesList = JSON.parse(JSON.stringify({}));

    $scope.editZoneMode = -1;
    $scope.editZoneValues = [];


    $scope.annotationZoneList = JSON.parse(JSON.stringify({}));
    $scope.divCounter = 0;

    //$rootScope.annZoneBoxSizeX = 0;
    //$rootScope.annZoneBoxSizeY = 0;

    $rootScope.currCanWidth = 0;

    $rootScope.currCanHeight = 0;


    $scope.updateAnnZonePos = function(posObj) {
      console.log(posObj);
    };



    $rootScope.createMovableAnnZone = function() {
      var element = $scope.addAnnotationZone(0, 0, 0.3, 0.3, "#ac725e", "", true, false, "");
      //addAnnotationZoneElement(element);
      var annZoneId = element.id;

      $scope.tagNamesList[annZoneId] = "";
    };

    $rootScope.getTagNamesList = function(){
      return $scope.tagNamesList;
    };

    $rootScope.getAnnotationZoneList = function(){
      return $scope.annotationZoneList;
    };


    $scope.addAnnotationZone = function(relLeft,relTop, relWidth, relHeight, color, tagName, isBeingCreated, canBeEdited, annZoneId) {




      var newAnnZone = {
        relativePosition: {
          x: relLeft,
          y: relTop
        },
        relativeSize: {
          x: relWidth,
          y: relHeight
        },
        color: color,
        colorBeforeEdit: color,
        tagName: tagName,
        editTagNameTemp: tagName.slice(1),
        dragable: isBeingCreated,
        isBeingCreated: isBeingCreated,
        canBeEdited: canBeEdited,
        annZoneId: annZoneId,
        divCounter: $scope.divCounter,
        id: 'rect-'+$scope.divCounter,
        tagNameIsValidated: false,
      };
      $scope.annotationZoneList[newAnnZone.id] = newAnnZone;
      $scope.divCounter += 1;
      console.log("ADDED ZONE");
      console.log("DivC after: "+ $scope.divCounter);
      console.log($scope.annotationZoneList);

      $timeout(function(){

        $scope.$apply();

      });
      return newAnnZone;
    };


    //$scope.annZoneMov = [];
    /*$scope.$watchCollection("storedAnnZones",function(newValue,oldValue){
      console.log($scope.storedAnnZones);
    });*/

    /*$scope.annZoneMov.reposition = function(params) {
        if (params.position) {
            annZoneMov.position = params.position;
        }
        if (params.size) {
            annZoneMov.size = params.size;
        }
    };*/

    $scope.setEditZoneMode = function(id) {
      $rootScope.resetEditAndReplyMode();

      $scope.editZoneMode = id;
      console.log("setEditZoneMode");
      console.log(id);

      $scope.annotationZoneList[id].colorBeforeEdit = $scope.annotationZoneList[id].color;
      $rootScope.$broadcast('editZoneModeChanged',$scope.editZoneMode);


/*      var ele = $('select[name="colorpicker-change-background-color2"]');
      ele.parent().find(".simplecolorpicker").remove();
      ele.parent().css({"margin-left":"0px"});
      ele.remove();


      var nColorPickerEditInput = $('<select/>');
      nColorPickerEditInput.attr("name","colorpicker-change-background-color2");
      nColorPickerEditInput.append('<option value="#ac725e">#ac725e</option>  <option value="#d06b64">#d06b64</option>  <option value="#f83a22">#f83a22</option>  <option value="#fa573c">#fa573c</option>  <option value="#ff7537">#ff7537</option>  <option value="#ffad46">#ffad46</option>  <option value="#42d692">#42d692</option>  <option value="#16a765">#16a765</option>  <option value="#7bd148">#7bd148</option>  <option value="#b3dc6c">#b3dc6c</option>  <option value="#fbe983">#fbe983</option>  <option value="#fad165">#fad165</option>  <option value="#92e1c0">#92e1c0</option>  <option value="#9fe1e7">#9fe1e7</option>  <option value="#9fc6e7">#9fc6e7</option>  <option value="#4986e7">#4986e7</option>  <option value="#9a9cff">#9a9cff</option>  <option value="#b99aff">#b99aff</option>  <option value="#c2c2c2">#c2c2c2</option>  <option value="#cabdbf">#cabdbf</option>  <option value="#cca6ac">#cca6ac</option>  <option value="#f691b2">#f691b2</option><option value="#cd74e6">#cd74e6</option><option value="#a47ae2">#a47ae2</option>');
      nColorPickerEditInput.attr("id", "colorPickerEditInput-" + divCounter);
      nColorPickerEditInput.addClass("slideRectColorPickerEdit");
      nColorPickerEditInput = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(nColorPickerEditInput);


      $scope.editZoneValues[id].color = color;

      var wrapperElement = $("#slideRectWrapper-"+divCounter);
      wrapperElement.prepend(nColorPickerEditInput);
      wrapperElement.css({"margin-left":"-20px"});

      $("#rect-"+divCounter).hover(function () {
          $(this).stop().fadeTo("fast", "0.75");
      }, function () {
          $(this).stop().fadeTo("fast", "0.75");
      });
      $("#rect-"+divCounter).css('border', ' 1px dashed white');

      $('select[name="colorpicker-change-background-color2"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
      $('select[name="colorpicker-change-background-color2"]').simplecolorpicker("selectColor",color);




      nColorPickerEditInput.on('change', function() {
          $(this).parent().parent().parent().css('background-color', $(this).val());
          $(this).attr("value",$(this).val());
          $scope.editZoneValues[id].color = $(this).val();
          $timeout(function(){
            $scope.$apply();
          });
        });
*/

    };

    $rootScope.resetEditZoneMode = function() {
      //$rootScope.$broadcast('reloadTags');

      var id = $scope.editZoneMode;

      $scope.writeCommentMode = false;
      $scope.replyRawText = [];
      $scope.replyMode = -1;
      $scope.editZoneMode = -1;
      $rootScope.$broadcast('editZoneModeChanged',$scope.editZoneMode);


      /*var ele = $('select[name="colorpicker-change-background-color2"]');
      ele.parent().find(".simplecolorpicker").remove();
      ele.parent().css({"margin-left":"0px"});
      ele.remove();
      */
      if(id != -1){
        $scope.annotationZoneList[id].editTagNameTemp = $scope.annotationZoneList[id].tagName;
        $scope.annotationZoneList[id].color = $scope.annotationZoneList[id].colorBeforeEdit;

        $timeout(function(){
          $scope.$apply();
        });
      }
    };

    $scope.updateAnnZone = function (id) {

      $scope.annotationZoneList[id].tagName = $scope.annotationZoneList[id].editTagNameTemp;

      var config = {
        params: {
          updateId: $scope.annotationZoneList[id].annZoneId,
          author: $scope.currentUser.username,
          authorId: $scope.currentUser._id,
          updatedAnnZone:
          {
            annotationZoneName: "#"+$scope.annotationZoneList[id].tagName,
            color: $scope.annotationZoneList[id].color.substring(1)
          },
          pdfId: $scope.pdfFile._id,
        }
      };

      //console.log(config);



      $http.post("/slide-viewer/updateAnnZone/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                $rootScope.displayCommentSubmissionResponse(data.error);
              }
              else {
                $rootScope.displayCommentSubmissionResponse("Annotation zone update successful!");

                //TODO: reset everything
              }

              //console.log("updateAnnZoneEv");

              $rootScope.resetEditZoneMode();
              $scope.$emit('reloadTags');

          })
          .error(function (data, status, headers, config) {
              $rootScope.displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
      };

      $rootScope.removeAllActiveAnnotationZones = function () {
        for(var inputId in $scope.tagNamesList) {
          var element = $("#annotationZone #"+inputId);

          delete angular.element($("#annZoneList")).scope().tagNamesList[inputId];
          angular.element($("#annZoneList")).scope().timeout();

          element.remove();

          delete $rootScope.tagNameErrors[inputId];
          delete $scope.tagNamesList[inputId];

        }
      };

      /*TODO:ANGANNZONE
      $rootScope.removeAllActiveAnnotationZones = function () {
        for(var inputId in $scope.tagNamesList) {
          delete $scope.annotationZoneList[inputId];

          delete $scope.tagNameErrors[inputId];
          delete $scope.tagNamesList[inputId];

          $timeout(function(){
            $scope.$apply();
          });
        }
      };
      */

    /*$rootScope.removeAnnotationZone = function (id) {
      var element = $("#annotationZone #"+id);

      //var annotationInList = $("#annotationZoneSubmitList div").find("[value='"+id+"']");

      var inputId = element.attr("id");

      //delete angular.element($("#annZoneList")).scope().tagNamesList[inputId];
      delete $scope.tagNamesList[inputId];
      $scope.timeout();

      //annotationInList.parent().remove();
      element.remove();

      delete $scope.tagNameErrors[id];
      delete $scope.tagNamesList[id];

    };
    */
    $rootScope.removeAnnotationZone = function (id) {

      delete $scope.annotationZoneList[id];

      delete $scope.tagNamesList[id];


      delete $rootScope.tagNameErrors[id];

      $scope.timeout();

    };

    $scope.refreshTags = function() {
      $http.get('/slide-viewer/disAnnZones/' + $scope.pdfId + '/'+$scope.currentPageNumber).success(function (data) {
        $scope.annZones = data.annZones;

        //tagListLoaded($scope.annZones);

        $scope.tagListLoaded();

        $timeout(function(){
          $scope.$apply();
        });
        console.log($scope.annotationZoneList);
      });
    };

    $scope.tagListLoaded = function() {
      for(var i = 0; i < $scope.annZones.length; i++) {
        var ele = $scope.annZones[i];
        var isAuthor = (ele.author == angular.element($("#annZoneList")).scope().currentUser.username);
        var isAdmin =  angular.element($("#annZoneList")).scope().$root.user.role == "admin";
        var allowedToEdit = (isAdmin || isAuthor);

        if(ele.color[0] != '#')
          ele.color = '#'+ele.color;

        $scope.addAnnotationZone(ele.relPosX, ele.relPosY, ele.relWidth, ele.relHeight, ele.color, ele.name, false, allowedToEdit, ele.id)
      }
    };






    var pdfPageChangeListener = $rootScope.$on('onPdfPageChange', function(e, params){
      //console.log("PdfPageChange: ");
      $scope.$emit('reloadTags');
    });

    $scope.$on('$destroy',pdfPageChangeListener);


    var reloadTagsEventListener = $scope.$on('reloadTags', function(event) {
      console.log("Reload Tags called");
      //$(".slideRect").remove();
      //$scope.annotationZoneList = new Array();
      $scope.annotationZoneList = JSON.parse(JSON.stringify({}));
      $scope.divCounter = 0;

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];

      $timeout(function(){
        $scope.$apply();
      });

      $scope.refreshTags();
    });

    /*TODO:ANGANNZONE
    var reloadTagsEventListener = $scope.$on('reloadTags', function(event) {
      $scope.annotationZoneList = new Array();
      $scope.divCounter = 0;

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];
      $scope.refreshTags();
    });
    */


    $scope.$on('$destroy',reloadTagsEventListener);




    $scope.compileMovableAnnotationZone = function(element) {
      return angular.element(
        $injector.get('$compile')(element)($scope)
      );
    };

    //Check if names of new annZones are correct
    $scope.$watch("annotationZoneList", function (newValue, oldValue) {
      if(newValue != oldValue) {
        if(typeof $scope.annotationZoneList != "undefined") {
          for(var key in newValue) {
            var annZone = newValue[key];
            if(annZone.isBeingCreated){

              var tName = newValue[key].tagName;
              //console.log(newValue[key]);
              var response = $rootScope.checkTagName(tName);
              if(response.length != 0) {
                changeValidationDisplay(key, tName, false, response);
              }
              else {
                changeValidationDisplay(key, tName, true, response);
              }
            }
          }
        }
      }
    },true);

    $rootScope.checkTagName = function (tagName) {
      if(!(/^[a-zA-Z0-9]*$/.test(tagName))) {
        return "Annotation zone contains illegal characters (only alphanumeric allowed)";
      }
      if(!(tagName.length >= 3)) {
        return "Annotation zone name is too short (>=3 characters)";
      }
      if(!(tagName.length < 10)) {
        return "Annotation zone name is too long (<10 characters)";
      }
      if(inOldTagList(tagName)) {
        return "Annotation zone name is already taken (unique over entire document)";
      }

      return "";
    }

    function inOldTagList(tagName) {
      //console.log($scope.annZones);
      for(var key in $scope.annZones) {
        if($scope.annZones[key].name == "#"+tagName) {
          return true;
        }
      }
      return false;
    }

    function changeValidationDisplay (key, name, success, text) {
      $scope.annotationZoneList[key].tagNameIsValidated = success;

      if(success){
        /*$("#"+key).find(".validationIcon").addClass("glyphicon");
        $("#"+key).find(".validationIcon").removeClass("glyphicon-remove-sign");
        $("#"+key).find(".validationIcon").addClass("glyphicon-ok-sign");
        */
        delete $rootScope.tagNameErrors[key];
        $timeout(function(){
          $scope.$apply($rootScope.tagNameErrors);
        });
      }
      else {
        $rootScope.tagNameErrors[key] = {name : name, text : text};

        $timeout(function(){
          $scope.$apply($rootScope.tagNameErrors);
        });
      }
    }

    $rootScope.nameHasNoError = function (name) {

      for(var key in $rootScope.tagNameErrors) {
        if($rootScope.tagNameErrors[key].name == name.substring(1)) {
          if($rootScope.tagNameErrors[key].text == "") {
            return true;
          }
          else {
            return false;
          }
        }
      }
      return true;
    };


    $rootScope.clearTagNameErrors = function () {
      /*for(var key in $scope.tagNameErrors) {
        delete $scope.tagNameErrors[key];
        //console.log($scope.tagNameErrors[key]);
      }*/
      $rootScope.tagNameErrors = JSON.parse(JSON.stringify({}));
      $scope.tagNamesList = JSON.parse(JSON.stringify({}));

      $timeout(function(){
        $scope.$apply($rootScope.tagNameErrors);
      });
    };

    $scope.timeout = function () {
      $timeout(function(){
        $scope.$apply($rootScope.tagNameErrors);
      });
    };


});
;app.controller('CommentListController', function ($scope, $http, $rootScope, $sce, $timeout, ActionBarService) {

    $scope.recentSubmitOnAnnotation = "";

    $scope.comment = {};

    $scope.editRawText = [];
    $scope.editMode = -1;

    $scope.replyRawText = [];
    $scope.replyMode = -1;

    $scope.comments = [];
    $scope.replies = [];

    $scope.orderType = false;
    $scope.orderBy = false;
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = {};
    $scope.currentPageNumber = 1;
    $scope.annotationZones = [];

    $scope.rawSearchTerm = "";
    var baseFilterString = "Currently no filters are active";
    $scope.activeFilterString = baseFilterString;

    /*var visibleString = "visibility: visible;";
    var invisibleString = "visibility: hidden;";
    $scope.removeFiltersVisible = visibleString;
    */

    // zones
    $scope.tagNames = [];
    $scope.tagRelPos = [];
    $scope.tagRelCoord = [];
    $scope.tagColor = [];

    $scope.writeCommentMode = false;



    var pdfPageChangeListener = $rootScope.$on('onPdfPageChange', function (e, params) {
        $scope.currentPageNumber = params[0];
        $scope.getComment($scope.orderType.id);
    });

    $rootScope.$on('$destroy',pdfPageChangeListener);

    $scope.orderingOptions = [
        {id: 'dateOfCreation.descending', name: 'Newest First'},
        {id: 'dateOfCreation.ascending', name: 'Oldest First'},
        {id: 'author.descending', name: 'Author (descending)'},
        {id: 'author.ascending', name: 'Author (ascending)'}
        //todo: {id: 'relevance', name: 'Relevance'}
    ];

    /*
    $scope.populateAnnotationZone = function () {
        $scope.annotationZones = [];

        // look for zones that are inside wrapper of the annotation zones
        var annotationList = $("#annotationZoneSubmitList div");

        //console.log(annotationList);

        for (var i = 0; i < annotationList.length; i++) {
            //console.log("added tag");
            //TODO: Adapt to next rectangle iteration
            var elementId = $("#annotationZoneSubmitList #rectangleId").eq(i).val();
            var element = $("#" + elementId);
            var relPosX = element.position().left / $('#annotationZone').width();
            var relPosY = element.position().top / $('#annotationZone').height();
            var relWidth = element.width() / $('#annotationZone').width();
            var relHeight = element.height() / $('#annotationZone').height();

            var name = element.find(".slideRectInput").val();
            //console.log("Name found: "+element.find(".slideRectInput").length);
            //var name = $("#annotationZoneSubmitList #annotationZoneSubmitName").eq(i).val();
            var color = element.find(".slideRectColorPicker").val().substring(1);
            //console.log("Color found: "+color);
            //var color = $("#annotationZoneSubmitList #annotationZoneSubmitColor").eq(i).val();

            if (name == "") {
                //console.log("Error encountered while extracting annotation zone during submission.");
                return false;
            }
            else if($rootScope.checkTagName(name) != "") {
                //console.log("TAGNAME NOT ACCEPTABLE");
                return false;
            }
            else {
                $scope.addAnnotationZoneData("#" + name, relPosX, relPosY, relWidth, relHeight, color, $scope.pdfFile._id, $scope.currentPageNumber );
            }
        }

        $scope.comment.tagNames = $scope.tagNames.join(',');
        $scope.comment.tagRelPos = $scope.tagRelPos.join(',');
        $scope.comment.tagRelCoord = $scope.tagRelCoord.join(',');
        $scope.comment.tagColor = $scope.tagColor.join(',');

        //TODO: Check integrity of the input
        //console.log("got here");
        return true;
    };
    */
    $scope.populateAnnotationZone = function () {
        $scope.annotationZones = [];


        var tagNamesList = $rootScope.getTagNamesList();
        var annotationZoneList = $rootScope.getAnnotationZoneList();
        for(var inputId in tagNamesList) {
          if(annotationZoneList[inputId].isBeingCreated == true){
            var relPosX = annotationZoneList[inputId].relativePosition.x;
            var relPosY = annotationZoneList[inputId].relativePosition.y;
            var relWidth = annotationZoneList[inputId].relativeSize.x;
            var relHeight = annotationZoneList[inputId].relativeSize.y;

            var name = annotationZoneList[inputId].tagName;
            var color = annotationZoneList[inputId].color;

            var errorText = $rootScope.checkTagName(name);

            if(errorText != "") {
                return errorText;
            }
            else {
                $scope.addAnnotationZoneData("#" + name, relPosX, relPosY, relWidth, relHeight, color, $scope.pdfFile._id, $scope.currentPageNumber );
            }
          }
        }

        $scope.comment.tagNames = $scope.tagNames.join(',');
        $scope.comment.tagRelPos = $scope.tagRelPos.join(',');
        $scope.comment.tagRelCoord = $scope.tagRelCoord.join(',');
        $scope.comment.tagColor = $scope.tagColor.join(',');

        return "";
    };


    $scope.addAnnotationZoneData = function (name, relPosX, relPosY, relWidth, relHeight, color, pdfId, pdfPageNumber) {
        $scope.tagNames.push(name);
        $scope.tagRelPos.push(relPosX + ";" + relPosY);
        $scope.tagRelCoord.push(relWidth + ";" + relHeight);
        $scope.tagColor.push(color);

        var zone = {
            annotationZoneName: name,
            relativeCoordinates: {
                X: relPosX,
                Y: relPosY
            },
            relativeDimensions: {
                X: relWidth,
                Y: relHeight
            },
            color: color,
            pdfId: pdfId,
            pdfPageNumber: pdfPageNumber,
            author: $scope.currentUser.username,
            authorID: $scope.currentUser._id
        };

        /*var oldText;
        oldText = $("#tagNames").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }

        $("#tagNames").val(oldText + "" + name);
        oldText = $("#tagRelPos").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }
        $("#tagRelPos").val(oldText + "" + relPosX + ";" + relPosY);
        oldText = $("#tagRelCoord").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }
        $("#tagRelCoord").val(oldText + "" + relWidth + ";" + relHeight);
        oldText = $("#tagColor").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }
        $("#tagColor").val(oldText + "" + color);*/

        $scope.annotationZones.push(zone);
        //$scope.annotationZones[$scope.annotationZones.length]=zone;

    };

    $scope.submitReply = function (id) {


      var config = {
        params: {
          rawText: $scope.replyRawText[id],
          author: $scope.currentUser.username,
          authorID: $scope.currentUser._id,
          pageNumber: $scope.currentPageNumber,
          numOfAnnotationZones: 0,
          pdfId: $scope.pdfFile._id,
          hasParent: true,
          parentId: id
        }
      };



      $http.post("/slide-viewer/submitComment/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                displayCommentSubmissionResponse(data.error);
              }
              else {
                displayCommentSubmissionResponse("Comment submission successful!");

                //TODO: reset everything
              }
              //console.log("commReplyEv");

              $scope.recentSubmitOnAnnotation = id;

              //console.log("Recent: "+ $scope.recentSubmitOnAnnotation);

              $rootScope.$broadcast('reloadTags');

              $scope.writeCommentMode = false;
              $scope.replyRawText = [];
              $scope.replyMode = -1;

          })
          .error(function (data, status, headers, config) {
              displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
    };

    $scope.deleteCommentById = function (id) {
      //console.log(id);
      var config = {
          params: {
              deleteId: id,
              author: $scope.currentUser.username,
              authorId: $scope.currentUser._id
          }
      };

      $http.post("/slide-viewer/deleteComment/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                displayCommentSubmissionResponse(data.error);
              }
              else {
                displayCommentSubmissionResponse("Comment deletion successful!");
              }
              //console.log("commDeleteEv");

              $rootScope.$broadcast('reloadTags');
          })
          .error(function (data, status, headers, config) {
              displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
    };

    $scope.submitComment = function (resultVarName) {
        var annZoneCheckResult = $scope.populateAnnotationZone();
        if(annZoneCheckResult != "") {
          displayCommentSubmissionResponse("Client Error: Some of the attached annotation zones are invalid: "+annZoneCheckResult);
          return false;
        }

        $rootScope.clearTagNameErrors();

        var config = {
            params: {
                rawText: $scope.comment.rawText,
                author: $scope.currentUser.username,
                authorID: $scope.currentUser._id,
                pageNumber: $scope.currentPageNumber,
                tagNames: $scope.comment.tagNames,
                tagRelPos: $scope.comment.tagRelPos,
                tagRelCoord: $scope.comment.tagRelCoord,
                tagColor: $scope.comment.tagColor,
                annotationZones: $scope.annotationZones,
                numOfAnnotationZones: $scope.annotationZones.length,
                pdfId: $scope.pdfFile._id,
                hasParent: false
            }
        };

        $http.post("/slide-viewer/submitComment/", null, config)
            .success(function (data, status, headers, config) {
                $scope.updateScope($scope.commentGetUrl);
                //$scope.savedZones = data.annotationZones;

                if(data.result == false){
                  displayCommentSubmissionResponse(data.error);
                }
                else {
                  displayCommentSubmissionResponse("Comment submission successful!");

                  $scope.comment.rawText = '';
                  $scope.setQuillSelection();
                  $scope.comment.tagNames = '';
                  $scope.comment.tagRelPos = '';
                  $scope.comment.tagRelCoord = '';
                  $scope.comment.tagColor = '';

                  $("#annotationZoneSubmitList div").remove();
                }
                //console.log("commSubmitEv");
                $rootScope.$broadcast('reloadTags');

                $scope.writeCommentMode = false;
            })
            .error(function (data, status, headers, config) {
                displayCommentSubmissionResponse("Error: Unexpected Server Response!");
            });
    };


    $scope.submitEdit = function (comment) {


      var config = {
          params: {
              updateId: comment._id,
              author: $scope.currentUser.username,
              authorId: $scope.currentUser._id,
              rawText: $scope.editRawText[$scope.editMode]
          }
      };

      $http.post("/slide-viewer/updateComment/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                displayCommentSubmissionResponse(data.error);
              }
              else {
                displayCommentSubmissionResponse("Comment edit successful!");

                $scope.comment.rawText = '';
                $scope.setQuillSelection();
              }
              //console.log("commEditEv");
              $rootScope.$broadcast('reloadTags');

              $scope.writeCommentMode = false;
          })
          .error(function (data, status, headers, config) {
              displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
    };

    $scope.setQuillSelection = function(){
        for(var i = 0; i < Quill.editors.length; i++){
            if(Quill.editors[i].quillId == '#rawText'){
                Quill.editors[i].setSelection(0,0);
            }
        }
    };

    function displayCommentSubmissionResponse(text) {
      var label = $("#commentSubmissionResponse");
      label.text(text);
      label.show();
      label.fadeOut(5000);
      //label.animate({opacity:0.0},5000);
    };

    $scope.currentUser = "";
    $rootScope.$watch('user', function () {
        if ($rootScope.user) {
            $scope.currentUser = $rootScope.user;
        }
    });

    $rootScope.displayCommentSubmissionResponse = function(text) {
      displayCommentSubmissionResponse(text);
    };



    //$scope.pageFilter;

    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;

    $scope.setRegexFilter = function (value) {
        if(typeof $scope.filtersRaw['rawText'] == 'undefined') {
          $scope.filtersRaw['rawText'] = {'regex': value};
        }
        else
          $scope.filtersRaw['rawText'].regex = value;

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.switchRegexHashFilter = function (value) {
        //console.log("switchRegexHashFilter CALLED");
        if( typeof $scope.filtersRaw['renderedText'] == 'undefined')
          $scope.filtersRaw['renderedText'] = {'regex_hash': value.substring(1)};
        else if( $scope.filtersRaw['renderedText'].regex_hash != value.substring(1) )
          $scope.filtersRaw['renderedText'].regex_hash = value.substring(1);
        else
          delete $scope.filtersRaw['renderedText'];
        //console.log($scope.filtersRaw);

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.authorLabelClick = function (authorName) {
        //console.log("AUTHORLABELCLICK CALLED");
        if($scope.filtersRaw['author'] == authorName)
          delete $scope.filtersRaw['author'];
        else
          $scope.filtersRaw['author'] = authorName;

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.$on('onFiltersRawChange', function () {
      var temp = "You are currently filtering for posts";
      var add = "";
      if ( typeof $scope.filtersRaw['author'] != 'undefined' && $scope.filtersRaw['author'] != "" )
        add += " authored by '" + $scope.filtersRaw['author'] + "'";
      if ( typeof $scope.filtersRaw['renderedText'] != 'undefined')
        if ( typeof $scope.filtersRaw['renderedText'].regex_hash != 'undefined' && $scope.filtersRaw['renderedText'].regex_hash != "" )
          add += " referencing the annotation zone '" + $scope.filtersRaw['renderedText'].regex_hash + "'";
      /*if(typeof $scope.filtersRaw['rawText'] != 'undefined')
        if ( $scope.filtersRaw['rawText'].regex != 'undefined' && $scope.filtersRaw['rawText'].regex != "")
          temp += " containing the term '" + $scope.filtersRaw['renderedText'].regex_hash + "'";
        */
      if(add.length == 0) {
        $scope.activeFilterString = baseFilterString;
        //$scope.removeFiltersVisible = invisibleString;

      }
      else {
        $scope.activeFilterString = temp + add;
        //$scope.removeFiltersVisible = visibleString;

      }

      $timeout(function () {
          $scope.$apply();
          $scope.commentsLoaded();
      });

    });

    $scope.removeActiveFilters = function () {
      if ( typeof $scope.filtersRaw['author'] != 'undefined' && $scope.filtersRaw['author'] != "" )
        delete $scope.filtersRaw['author'];
      if ( typeof $scope.filtersRaw['renderedText'] != 'undefined')
        delete $scope.filtersRaw['renderedText'];
      $scope.$broadcast('onFiltersRawChange');
    };

    //TODO:ANGANNZONE
    $scope.commentsLoaded = function () {
        var element = $("#commentList .annotationZoneReference").not('.hasOnClick');
        if ($("#commentList .annotationZoneReference").not('.hasOnClick').length != 0) {
            //console.log("ADDED CLICK FUNCTION");
            //console.log($("#commentList .annotationZoneReference").length);
            $("#commentList .annotationZoneReference").not('.hasOnClick').click(function () {
              //console.log("switchRegexHashFilter CALLED");
              $scope.switchRegexHashFilter($(this).html());
            });

            $("#commentList .annotationZoneReference").not('.hasOnClick').addClass("hasOnClick");

            element.hover(function () {
                var rectId = $(this).html();
                $("#annotationZone [data-tagName='" + rectId + "']").stop().fadeTo("fast", opacityFactorHighlight);
                //$(this).find(".slideRectSpan").stop().fadeTo("fast",1.0); //can be deleted because parent inherit its opacity
            }, function () {
                var rectId = $(this).html();
                $("#annotationZone [data-tagName='" + rectId + "']").stop().fadeTo("fast", opacityFactor);
                //$(this).find(".slideRectSpan").stop().fadeTo("fast",opacityFactor);//can be deleted because parent inherit its opacity
            });

        }
    };

    $scope.changeEditMode = function (id, bool) {
      //$scope.finalEditRawText = "";
      $scope.editRawText = [];
      if(bool) {
        $scope.editMode = id;
        $scope.replyMode = -1;
        $scope.writeCommentMode = false;
        $rootScope.resetEditZoneMode();
      }
      else if($scope.editMode == id){
        $scope.editMode = -1;
      }
    };

    $rootScope.resetEditAndReplyMode = function (){
      $scope.editMode = -1;
      $scope.replyMode = -1;
      $scope.writeCommentMode = false;

    };

    $scope.changeReplyMode = function (id, bool) {
      //$scope.finalEditRawText = "";
      $scope.replyRawText = [];
      if(bool) {
        $scope.replyMode = id;
        $scope.editMode = -1;
        $scope.writeCommentMode = false;
        $rootScope.resetEditZoneMode();
      }
      else if($scope.replyMode == id){
        $scope.replyMode = -1;
      }
    };

    $scope.updateScope = function(url) {
        $http.get(url).success(function (data) {
            //console.log('COMMENTS UPDATED');
            //console.log("url: " + url);


            $scope.editMode = -1;
            /*for (var i in $scope.comments) {
                var cmnt = $scope.comments[i];
                //cmnt.html = $sce.trustAsHtml(cmnt.html);



            }*/
            $scope.comments = [];
            $scope.replies = [];

            for(var item in data.comments) {
              if(data.comments[item].hasParent == false) {
                //data.comments[item].isAuthor = true;
                $scope.comments.push(data.comments[item]);
              }
              else if(data.comments[item].hasParent == true){
                if(typeof $scope.replies[data.comments[item].parentId] == 'undefined') {
                  $scope.replies[data.comments[item].parentId] = [];
                }
                //console.log($scope.currentUser.username);
                //console.log(data.comments[item].author);
                data.comments[item].isAuthor = (data.comments[item].author == $scope.currentUser.username);
                $scope.replies[data.comments[item].parentId].push(data.comments[item]);
              }
            }

            //$scope.comments = data.comments;


            $timeout(function () {
                $scope.$apply();
                $scope.commentsLoaded();
            });

        });
    };

    function getCurrentFilters() {
        /*
         refactored by using array of filtersRaw. will be converted with JSON.stringify.
         regex_has and regex is replaced by using scope.switchregex... function

         var finalFilters;

         var filterStrings = $scope.filtersRaw.split(';');
         //console.log("FOUND RAW FILTERS: " + $scope.filtersRaw);
         finalFilters = '{';
         if(filterStrings.length >= 1) if(filterStrings[0]!=""){

         for(var i=0; i < filterStrings.length; i++){
         //console.log("APPLIED A FILTER");
         var temp = filterStrings[i].split(',');
         if(temp.length != 1)
         finalFilters = finalFilters + '"' + temp[0] + '":"' + temp[1] + '"';
         else
         {
         temp = filterStrings[i].split(':');
         if(typeof temp[1] != 'undefined') {
         if(temp[1].charAt(0) == "#")
         finalFilters = finalFilters + '"' + temp[0] + '":{"regex_hash": "' + temp[1].substring(1) + '"}';
         else {
         finalFilters = finalFilters + '"' + temp[0] + '":{"regex": "' + temp[1].substring(1) + '"}';
         }
         }
         }


         //if(i != filterStrings.length-1)
         finalFilters = finalFilters + ',';
         }
         }*/

        if (!isNaN($scope.currentPageNumber)) {
            $scope.filtersRaw['pdfPageNumber'] = $scope.currentPageNumber;
        }
        if (!(typeof ($scope.pdfFile._id) == "undefined")) {
          $scope.filtersRaw['pdfId'] = $scope.pdfFile._id;
        }


        //console.log($scope.filtersRaw);
        var finalFilters = JSON.stringify($scope.filtersRaw);

        //console.log("Final Filters: " + finalFilters);
        return finalFilters;
    }

    $scope.parseOrderType = function (orderType) {
        var orderSplit = orderType.split('.');
        $scope.orderBy = orderSplit[0];
        if (orderSplit[1]) {
            $scope.ascending = (orderSplit[1] == 'ascending') ? true : false;
        } else
            $scope.ascending = false;
    };

    $scope.getComment = function (orderType) {
        $scope.parseOrderType(orderType);

        $scope.filters = getCurrentFilters($scope.filtersRaw);
        $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
        $scope.updateScope($scope.commentGetUrl);
    };

    $scope.manageActionBar = function(){
        if($scope.currentTab == 'pdf') {

                //commented because we want to use own toolbar
          /*  ActionBarService.extraActionsMenu.push({
                clickAction: $scope.switchCommentSubmissionDisplay,
                title: '<i class="ionicons ion-edit"></i> &nbsp;ADD COMMENT',
                aTitle: 'Write a comment on this slide'
            });*/
        }
    };

    $scope.init = function () {
        //$scope.getComment($scope.orderingOptions[0].id); // commented, because it will get called once pdf get loaded
    };

    $scope.$watch("orderType", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.orderType = newValue;
            $scope.getComment(newValue.id);
        }
    });

    /*$scope.$watch("filtersRaw", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.parseOrderType($scope.orderType.id);
            //console.log("NOTICED FILTERS CHANGE");
            $scope.filters = getCurrentFilters($scope.filtersRaw);
            $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
            //console.log("commentGetUrl: " + $scope.commentGetUrl);
            $scope.updateScope($scope.commentGetUrl);
        }
    });*/

    $scope.$on('onFiltersRawChange', function () {
        $scope.parseOrderType($scope.orderType.id);
        //console.log("NOTICED FILTERS CHANGE");
        $scope.filters = getCurrentFilters($scope.filtersRaw);
        $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
        //console.log("commentGetUrl: " + $scope.commentGetUrl);
        $scope.updateScope($scope.commentGetUrl);
    });

    $scope.$watch("currentPageNumber", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.parseOrderType($scope.orderType.id);
            $scope.filters = getCurrentFilters($scope.filtersRaw);
            $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
            //console.log("commentGetUrl: " + $scope.commentGetUrl);
            $scope.updateScope($scope.commentGetUrl);
        }
    });

    $scope.$watch("rawSearchTerm", function (newValue, oldValue) {
      if(newValue != oldValue) {
        $scope.setRegexFilter(newValue);
      }
    });

    $scope.$watch("writeCommentMode", function (newValue, oldValue) {
      if(newValue == true) {
        $scope.editMode = -1;
        $scope.replyMode = -1;
        $rootScope.resetEditZoneMode();
      }
      else {
        $rootScope.removeAllActiveAnnotationZones();
        $scope.comment.rawText = "";
      }
    });

    $scope.annotationZoneAction = function(){
        // in slideviewer.js
        $rootScope.switchShowAnnoZones = "On"
        //createMovableAnnZone();
        //TODO:ANGANNZONE
        $rootScope.createMovableAnnZone();
    };





    $scope.switchCommentSubmissionDisplay = function() {
        $scope.writeCommentMode = true;
    };

    $scope.$on('onAfterInitTreeNode', function(event, treeNode){
        /**
         * get comments on page load
         */
        $scope.init();

        /**
         * add some action to the menu
         */
        $scope.manageActionBar();
    });

    $scope.$on('$routeUpdate', function(){
        $scope.manageActionBar();
    });

    /*
    $scope.addReference = function(name) {
      //$rootScope.safeApply(function() {
      if($rootScope.nameHasNoError(name)){
        if(name !="#")
        if($scope.writeCommentMode) {
          if(typeof $scope.comment.rawText == 'undefined')
            $scope.comment.rawText = name + ' ';
          else {
            var len = $scope.comment.rawText.length;
            var firstPart = $scope.comment.rawText.substring(0,len-6);
            var lastPart = $scope.comment.rawText.substring(len-6);
            $scope.comment.rawText = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.editMode != -1){
          if(typeof $scope.editRawText[$scope.editMode] == 'undefined')
            $scope.editRawText[$scope.editMode] = name + ' ';
          else {
            var len = $scope.editRawText[$scope.editMode].length;
            var firstPart = $scope.editRawText[$scope.editMode].substring(0,len-6);
            var lastPart = $scope.editRawText[$scope.editMode].substring(len-6);
            $scope.editRawText[$scope.editMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.replyMode != -1){
          if(typeof $scope.replyRawText[$scope.replyMode] == 'undefined')
            $scope.replyRawText[$scope.replyMode] = name + ' ';
          else {
            var len = $scope.replyRawText[$scope.replyMode].length;
            var firstPart = $scope.replyRawText[$scope.replyMode].substring(0,len-6);
            var lastPart = $scope.replyRawText[$scope.replyMode].substring(len-6);
            $scope.replyRawText[$scope.replyMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }

        $timeout(function () {
            $scope.$apply();
            $scope.commentsLoaded();
        });
      }
    };
    */
    $rootScope.addReference = function(id) {
      var annZoneList = $rootScope.getAnnotationZoneList();
      var name = "#"+annZoneList[id].tagName;
      //$rootScope.safeApply(function() {
      if($rootScope.nameHasNoError(name)){
        if(name !="#")
        if($scope.writeCommentMode) {
          if(typeof $scope.comment.rawText == 'undefined')
            $scope.comment.rawText = name + ' ';
          else {
            var len = $scope.comment.rawText.length;
            var firstPart = $scope.comment.rawText.substring(0,len-6);
            var lastPart = $scope.comment.rawText.substring(len-6);
            $scope.comment.rawText = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.editMode != -1){
          if(typeof $scope.editRawText[$scope.editMode] == 'undefined')
            $scope.editRawText[$scope.editMode] = name + ' ';
          else {
            var len = $scope.editRawText[$scope.editMode].length;
            var firstPart = $scope.editRawText[$scope.editMode].substring(0,len-6);
            var lastPart = $scope.editRawText[$scope.editMode].substring(len-6);
            $scope.editRawText[$scope.editMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.replyMode != -1){
          if(typeof $scope.replyRawText[$scope.replyMode] == 'undefined')
            $scope.replyRawText[$scope.replyMode] = name + ' ';
          else {
            var len = $scope.replyRawText[$scope.replyMode].length;
            var firstPart = $scope.replyRawText[$scope.replyMode].substring(0,len-6);
            var lastPart = $scope.replyRawText[$scope.replyMode].substring(len-6);
            $scope.replyRawText[$scope.replyMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }

        $timeout(function () {
            $scope.$apply();
            $scope.commentsLoaded();
        });
      }
    };



    $scope.setEditRawText = function(id,newText) {
      $scope.editRawText[id] = strip(newText);
      $timeout(function () {
          $scope.$apply();
      });
    };

    $scope.setReplyRawText = function(id,newText) {

      $scope.replyRawText[id] = newText;
      $timeout(function () {
          $scope.$apply();
      });
    };

    function strip(html)
    {
       var tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    }

    /*$scope.$watch("editRawText", function (newValue, oldValue) {
      console.log("REGISTERED CHANGE");
    });*/

    $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
    };

    $scope.removeFilterRawField = function (id) {
      delete $scope.filtersRaw[id];
      $scope.$broadcast('onFiltersRawChange');
    };
});
;app.controller('HomePageController', function ($scope, $http, $rootScope, $sce, Page) {
    $scope.hideSlider = false;
    $scope.isRequesting = false;
    $scope.widgets = [];
    Page.setTitleWithPrefix('Home');

    $(document).ready(function () {
        if (typeof(localStorage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            if (localStorage.hideSlider) {
                $scope.hideSlider = localStorage.hideSlider;
            }
        }

        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x: $scope.width / 2, y: ($scope.height / 2) - 100};
    });

    /**
     * get all categories, recursived on the server
     */
    $http.get('/api/categories').success(function (data) {
        if (data.categories) {
            $scope.categories = data.categories;
        }
        else
            $scope.categories = false;
    });

    $scope.setHideSlider = function () {
        $scope.hideSlider = true;
        if (typeof(localStorage) !== "undefined")
            localStorage.hideSlider = true;
    };

    $scope.$watch('hideSlider', function () {
        if ($scope.hideSlider) {
            //$scope.initJSPlumb();
        }
    });

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        $scope.initJSPlumb();
    });

    $scope.initJSPlumb = function () {
        Tree.init(Canvas.w, Canvas.h);

        var instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
            ConnectionOverlays: [],
            Container: "category-map"
        });

        // so the ejs can access this instance
        $rootScope.initDraggable(instance);

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.categories, instance);

            /*blanket on click to close dropdown menu*/
            $scope.initDropDownMenuHybrid();
        });
    };

    $scope.initDropDownMenuHybrid = function () {
        $(document).on('click', function (event) {
            var target = $(event.target);
            var k = target.parents('div');
            if(k.hasClass('ui-draggable')){
                return false;
            }

            if ($('.open').length > 0) { 
                $('.open').removeClass('open');
                return false;
            }
        });
    };

    $scope.initDropDown = function (slug) {
        $('#' + slug)
            .on('click mousedown mouseup touchstart', function (event) {
                if ($(this).find('ul').hasClass('open')) {
                    if ($(this).find('li').hasClass('goto-button')) {
                        return true;
                    }

                    $('.open').removeClass('open');
                    return false;
                }

                $('.open').not($(this).parents('ul')).removeClass('open');
                $(this).find('ul').addClass('open');

                return false;
            })
            .on('mouseenter', function(){
                $http.get('/api/server-widgets/category-homepage/?slug=' + slug).success(
                    function (res) {
                        if (res.result) {
                            $scope.widgets[slug] = $sce.trustAsHtml(res.widgets);
                        }
                    }
                );
            });
    };

    $scope.interConnect = function (parent, categories, instance) {
        for (var i in categories) {
            var child = categories[i];

            $scope.initDropDown(child.slug);

            instance.connect({
                source: parent, target: child.slug,
                anchors: [
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape")}],
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + child.slug)[0].getAttribute("data-shape")}]
                ]
            });

            if (child.subCategories) {
                $scope.interConnect(child.slug, child.subCategories, instance);
            }
        }
    };

    $scope.goToDetail = function (categorySlug) {
        window.location.href = "/courses/#/category/" + categorySlug;
    };

});
;app.controller('LoginPageController', function($scope, $http, $rootScope, $cookies, authService, toastr, $location) {
    $scope.rememberMe = false;
    $scope.loginData = {};
    $scope.errors = [];
    $scope.user = null;
    $scope.referer = false;
    $scope.isLoading = false;

    authService.loginCheck(function(user){
        $scope.user = user;
        if($scope.user){
            window.location = '/accounts';
        }
    });

    if($cookies.rememberMe) {
        $scope.rememberMe = $cookies.rememberMe;
    }

    $scope.$watch('rememberMe', function(newVal, oldVal){
        if(newVal !== oldVal){
            $cookies.rememberMe = $scope.rememberMe;
        }
    });

    $scope.noticeAfterSignUp = function(){
        var k = $location.search();
        if(k.referer && k.referer == 'signUp' && k.result && k.result == 'success'){
            toastr.success('Please login using your new username and password!', 'Sign Up Success');
        }
    };

    $scope.noticeAfterSignUp();

    $scope.login = function(isValid){
        if(isValid){
            $scope.isLoading = true;
            authService.login($scope.loginData,
                function(user){
                    $scope.user = user;
                    if(!$scope.referer) {
                        window.location = '/accounts';
                    }
                    $scope.isLoading = false;
                },
                function error(data) {
                    if(data.errors){
                        $scope.errors = data.errors;
                    }
                    $scope.isLoading = false;
                }
            );
        }
    }

});;app.controller('MainController', function($scope, Page) {
    $scope.Page = Page;
});
;app.controller('MainMenuController', function($scope, $http, $rootScope, $cookies, authService, toastr) {
    $scope.rememberMe = false;
    $scope.loginData = {};
    $scope.errors = [];
    $scope.user = null;
    $scope.referer = false;
    $scope.isLoading = false;

    authService.loginCheck(function(user){
        $scope.user = user;
    });

    if($cookies.rememberMe) {
        $scope.rememberMe = $cookies.rememberMe;
    }

    $scope.$watch('rememberMe', function(newVal, oldVal){
        if(newVal !== oldVal){
            $cookies.rememberMe = $scope.rememberMe;
        }
    });

    $scope.login = function(isValid){
        if(isValid){
            $scope.isLoading = true;
            authService.login($scope.loginData,
                function(user){
                    $scope.user = user;
                    toastr.success('', "You're now logged in!");
                    $scope.isLoading = false;
                },
                function error(data) {
                    if(data.errors){
                        $scope.errors = data.errors;
                        $scope.isLoading = false;
                    }
                }
            );
        }
    }

});;app.controller('ActionBarController', function($scope, ActionBarService, $sce, $compile) {
    $scope.extraActionsMenu = [];

    $scope.$watch(function(){
        return ActionBarService.extraActionsMenu;
    },
        function (newValue) {
            $scope.extraActionsMenu = ActionBarService.extraActionsMenu;
        });
});;app.service('ActionBarService', function() {
    this.extraActionsMenu = [];
});;app.controller('SignUpController', function($scope, $http, $rootScope, $cookies, authService) {

    $scope.loginData = {};
    $scope.errors = [];
    $scope.isLoading = false;

    authService.loginCheck(function(user){
        if(user){
            window.location = '/accounts';
        }
    });

    $scope.signUp = function(isValid){
        if(isValid){
            $scope.isLoading = true;
            authService.signUp($scope.loginData,
                function(user){
                    $scope.isLoading = false;
                    window.location = '/accounts/login/#?referer=signUp&result=success';
                },
                function error(data) {
                    if(data.errors){
                        $scope.errors = data.errors;
                    }
                    $scope.isLoading = false;
                }
            );
        }
    }

});;app.controller('staticController', function($scope, $http, $rootScope) {

});
;app.controller('UserEditController', function($scope, $http, $rootScope, $timeout, authService) {
    $scope.user = {};
    $scope.formData = {};
    $scope.errors = null;

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.user = user;
        $scope.formData.displayName = $scope.user.displayName;
    });

    $scope.saveEditUser = function(){
        if($scope.user.displayName)
            $scope.formData.displayName = $scope.user.displayName;

        if($scope.formData.password ) {
            if ($scope.formData.password != $scope.formData.passwordConfirm) {

            }
        }

        var d = transformRequest($scope.formData);
        $http({
            method: 'PUT',
            url: '/api/accounts/' + $scope.user._id,
            data: d, // pass in data as strings
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                if(data.result) {
                    $scope.$emit('init');
                    authService.loginCheck(function(user){
                        $scope.user = user;
                        $timeout(function(){
                            $scope.$apply();
                            $('.user-image').attr('src', $scope.user.image);
                        });
                    });
                    $('#editAccountModal').modal('hide');
                }
            })
            .error(function(data){
                if(!data.result){
                    $scope.errors = data.errors;
                    console.log(data.errors);
                }
            });
    };

    $scope.cancel = function(){
        $('#editAccountModal').modal('hide');
    }

});
;app.controller('widgetController', function($scope, $http, $rootScope, $ocLazyLoad, $timeout) {
    $scope.location = "";
    $scope.widgets = [];
    $scope.widgetsTemp = [];

    $scope.initWidgetButton = function(id){
        $.AdminLTE.boxWidget.activate();
        $scope.addWidget(id);

        var h = $('#w' + id + ' .grid-stack-item-content');
        $('#w' + id + ' .grid-stack-item-content .box-body').css('height', (h.innerHeight() - 40) + 'px');
    };

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.$watch('location', function(newVal, oldVal){
            if($scope.location == 'user-profile'){
                $scope.getWidgets();
            }
        });
    });

    $scope.$on('onAfterInitCourse', function(event, course){
        $scope.course = course;
        $scope.getWidgets();
    });

    $scope.$watch('location', function(newVal, oldVal) {
        if($scope.location == '')
            return;

        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets();
        });

        var onafter2 = 'onAfterUninstall' + $scope.location;
        $scope.$on( onafter2, function(event, newWidget){
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets();
        });

    });

    $scope.lazyLoad = function(wdg, currentIndex, widgetJsArray, fileToLoad){
        (function(wdg) {
            var jsfn = '/' + wdg.application + '/' + fileToLoad;

            $ocLazyLoad.load(jsfn).then(function() {
                // the last one has been loaded
                var l = wdg.widgetId.widgetJavascript.length - 1;
                if(fileToLoad == wdg.widgetId.widgetJavascript[l]){
                    // only push to main widgets array when it is the last js to load
                    $scope.widgets.push(wdg);
                } else {
                    var nextFile = widgetJsArray[currentIndex++];
                    $scope.lazyLoad(wdg, currentIndex, widgetJsArray, nextFile);
                }
            });
        })(wdg);
    };

    $scope.getWidgets = function(){
        var id = "";

        if($scope.location == 'user-profile')
            id = $rootScope.user._id;

        else if($scope.location == 'course-preview' || $scope.location == 'course-analytics')
            id = $scope.course._id;

        $http.get('/api/widgets/' + $scope.location + '/' + id).success(function (data) {
            $scope.widgetsTemp = data.widgets;
            $scope.widgets = [];

            $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, $scope.widgetsTemp);

            for(var i in $scope.widgetsTemp){
                var wdg = $scope.widgetsTemp[i];

                // loop to load the js (if exist)
                if(wdg.widgetId.widgetJavascript) {
                    //if(wdg.widgetId.widgetJavascript.type() == 'Array'){
                    //for(var j = 0; j < wdg.widgetId.widgetJavascript.length; j++)
                    //var loading = true;


                    $scope.lazyLoad(wdg, 0, wdg.widgetId.widgetJavascript, wdg.widgetId.widgetJavascript[0]);
                    //}

                } else {
                    $scope.widgets.push(wdg);
                }
            }
        });
    };

    $scope.addWidget = function(id){
        var loc = '#' + $scope.location + '-widgets';
        var grid = $(loc).data('gridstack');

        var el = '#w' + id;

        // get width and height
        var i = _.findIndex($scope.widgets, { 'widgetId': {'_id' : id}});
        var wdg = $scope.widgets[i];

        //add_widget(el, x, y, width, height, auto_position)
        var x = 0;
        var y = 0;
        if(wdg.position){
            x = wdg.position.x;
            y = wdg.position.y;
        }
        grid.add_widget(el, x, y, wdg.width, wdg.height, false);
    };

    $scope.closeWidget = function(id){
        var i = _.findIndex($scope.widgets, { 'widgetId': {'_id' : id}});
        var wdg = $scope.widgets[i];

        $rootScope.$broadcast('onAfterCloseButtonClicked' + $scope.location, wdg);
    };

    $scope.initiateDraggableGrid = function(locs){
        $scope.location = locs;
        var loc = '#' + locs + '-widgets';

        var options = {
            cell_height: 340,
            vertical_margin: 10,
            resizable: false
            //allowed_grids: [0, 4, 8]
        };

        var curNode = {x:0, y:0};

        var $gs = $(loc);
        $gs.gridstack(options);

        $gs.on('onStartMove', function (e, node) {
            curNode.x = node.x;
            curNode.y = node.y;
        });

        $gs.on('onMove', function (e, node) {

        });

        $gs.on('onFinishDrop', function (e, node) {
            var o = $(node.el);

            if(options.allowed_grids && options.allowed_grids.indexOf(node.x) < 0){
                o.attr('data-gs-x', curNode.x).attr('data-gs-y', curNode.y);
            }

            var wId = o.attr('id').substr(1);
            $scope.setPosition(wId, node.x, node.y);
        });
    };

    $scope.setPosition = function(wId, x, y){
        $http.put('/api/widget/' + wId + '/setPosition', {
            x:x, y:y
        }).success(function(res){
            /*if(res.result)
            {
                console.log('set position success');
            }*/
        });
    };

});
;app.controller('widgetCourseAnalyticsController', function ($scope, $http, $rootScope,
                                                            $timeout, toastr,
                                                            widgetService, courseService, authService) {
    $scope.location = "course-analytics";
    $scope.widgets = [];

    $scope.getWidgets = function (force) {
        widgetService.getWidgetsOnLocation($scope.location, $scope.course._id,

            function (widgets) {
                $scope.widgets = widgets;
                $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, widgets);
            },

            function (errors) {
                toastr.error(errors);
            },

            force
        );
    };

    $scope.closeWidget = function (id) {
        widgetService.uninstall(id, {courseId: $scope.course._id},
            function (wdg) {
                var grid = $('#' + $scope.location + '-widgets').data('gridstack');
                grid.remove_all();
                $scope.getWidgets(true);
                toastr.success('Widget is uninstalled');
            },

            function (errors) {
                toastr.error('Uninstallation failed');
            }
        );
    };

    $scope.setupInstallmentWatch = function () {
        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });

        var onafter2 = 'onAfterUninstall' + $scope.location;
        $scope.$on(onafter2, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });
    };

    $scope.initWidgets = function () {

        if (courseService.course) {
            $scope.course = courseService.course;
            $scope.getWidgets();

        } else {
            $scope.$on('onAfterInitCourse', function (e, course) {
                $scope.course = course;
                $scope.getWidgets();
            });
        }

        var enableDragging = ($scope.isManager || authService.isAdmin() || $scope.isOwner) ? true : false;
        widgetService.initiateDraggableGrid($scope.location, enableDragging);

        $scope.setupInstallmentWatch();
    };

    $scope.initWidgetButton = function (id) {
        widgetService.initWidgetButton($scope.location, id)
    };

    $scope.checkOwnership = function (userId) {
        if (authService.user && authService.user._id == userId)
            return true;

        if ($scope.isManager || authService.isAdmin())
            return true;

        return false;
    };

    $scope.initWidgets();
});
;app.controller('widgetCoursePreviewController', function ($scope, $http, $rootScope,
                                                          $timeout, toastr,
                                                          widgetService, courseService, authService) {
    $scope.location = "course-preview";
    $scope.widgets = [];

    $scope.getWidgets = function (force) {
        widgetService.getWidgetsOnLocation($scope.location, $scope.course._id,

            function (widgets) {
                $scope.widgets = widgets;
                $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, widgets);
            },

            function (errors) {
                toastr.error(errors);
            },

            force
        );
    };

    $scope.closeWidget = function (id) {
        widgetService.uninstall(id, {courseId: $scope.course._id},
            function (wdg) {
                var grid = $('#' + $scope.location + '-widgets').data('gridstack');
                grid.remove_all();
                $scope.getWidgets(true);
                toastr.success('Widget is uninstalled');
            },

            function (errors) {
                toastr.error('Uninstallation failed');
            }
        );
    };

    $scope.setupInstallmentWatch = function () {
        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });

        var onafter2 = 'onAfterUninstall' + $scope.location;
        $scope.$on(onafter2, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });
    };

    $scope.initWidgets = function () {

        if (courseService.course) {
            $scope.course = courseService.course;
            $scope.getWidgets();

        } else {
            $scope.$on('onAfterInitCourse', function (e, course) {
                $scope.course = course;
                $scope.getWidgets();
            });
        }

        var enableDragging = ($scope.isManager || authService.isAdmin() || $scope.isOwner) ? true : false;
        widgetService.initiateDraggableGrid($scope.location, enableDragging);

        $scope.setupInstallmentWatch();
    };

    $scope.initWidgetButton = function (id) {
        widgetService.initWidgetButton('course-preview', id)
    };

    $scope.checkOwnership = function (userId) {
        if (authService.user && authService.user._id == userId)
            return true;

        if ($scope.isManager || authService.isAdmin())
            return true;

        return false;
    };

    $scope.initWidgets();
});
;app.controller('WidgetGalleryController', function ($scope, $http, $rootScope, toastr, widgetService) {
    $scope.location = "";
    $scope.installedWidgets;
    /**
     * get widgets store data from the server
     */
    $scope.initData = function (location) {
        $scope.location = location;

        $http.get('/api/widgets/' + location).success(function (data) {
            $scope.widgets = data.widgets;
        });
    };

    $scope.$watch('location', function (newVal, oldVal) {
        var onafter = 'onAfterGetWidgets' + $scope.location;
        $scope.$on(onafter, function (event, installedWidgets) {
            $scope.installedWidgets = installedWidgets;
        });

        var onCloseButtonClicked = 'onAfterCloseButtonClicked' + $scope.location;
        $scope.$on(onCloseButtonClicked, function (event, widget) {
            $scope.uninstall(widget._id);
        });
    });

    $scope.isInstalled = function (widgetId) {
        if ($scope.installedWidgets) {
            var isInstalled = _.find($scope.installedWidgets, {widgetId: {_id: widgetId}});
            return isInstalled;
        }

        return false;
    };

    $scope.install = function (location, application, name, extraParams) {

        widgetService.install(location, application, name, extraParams,

            function (installedWidget) {
                $scope.installedWidget = installedWidget;

                // hide the widget gallery
                $('#widgetGallery').modal('hide');
                $('#widgetGalleryAnalytics').modal('hide');
                toastr.success('Widget is installed');

                $rootScope.$broadcast('onAfterInstall' + location, $scope.installedWidget);
            },

            function (errors) {
                toastr.error('Installation failed');
            }
        );
    };

    $scope.uninstall = function (installId) {

        widgetService.uninstall(installId,
            function (uninstalled) {
                $scope.uninstalledWidget = uninstalled;

                // hide the widget gallery
                $('#widgetGallery').modal('hide');
                $('#widgetGalleryAnalytics').modal('hide');
                toastr.success('Widget is uninstalled');

                $rootScope.$broadcast('onAfterUninstall' + uninstalled.location, $scope.uninstalledWidget);
            },
            function (errors) {
                toastr.error('Uninstallation failed');
            }
        );
    };

});
;app.controller('widgetNodeAnalyticsController', function ($scope, $http, $rootScope,
                                                            $timeout, toastr,
                                                            widgetService, courseService, authService) {
    $scope.location = "node-analytics";
    $scope.widgets = [];

    $scope.getWidgets = function (force) {
        widgetService.getWidgetsOnLocation($scope.location, $scope.course._id,

            function (widgets) {
                $scope.widgets = widgets;
                $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, widgets);
            },

            function (errors) {
                toastr.error(errors);
            },

            force
        );
    };

    $scope.closeWidget = function (id) {
        widgetService.uninstall(id, {courseId: $scope.course._id},
            function (wdg) {
                var grid = $('#' + $scope.location + '-widgets').data('gridstack');
                grid.remove_all();
                $scope.getWidgets(true);
                toastr.success('Widget is uninstalled');
            },

            function (errors) {
                toastr.error('Uninstallation failed');
            }
        );
    };

    $scope.setupInstallmentWatch = function () {
        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });

        var onafter2 = 'onAfterUninstall' + $scope.location;
        $scope.$on(onafter2, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets(true);
        });
    };

    $scope.initWidgets = function () {

        if (courseService.course) {
            $scope.course = courseService.course;
            $scope.getWidgets();

        } else {
            $scope.$on('onAfterInitCourse', function (e, course) {
                $scope.course = course;
                $scope.getWidgets();
            });
        }

        var enableDragging = ($scope.isManager || authService.isAdmin() || $scope.isOwner) ? true : false;
        widgetService.initiateDraggableGrid($scope.location, enableDragging);

        $scope.setupInstallmentWatch();
    };

    $scope.initWidgetButton = function (id) {
        widgetService.initWidgetButton($scope.location, id)
    };

    $scope.checkOwnership = function (userId) {
        if (authService.user && authService.user._id == userId)
            return true;

        if ($scope.isManager || authService.isAdmin())
            return true;

        return false;
    };

    $scope.initWidgets();
});
