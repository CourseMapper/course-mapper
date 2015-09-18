var app = angular.module('courseMapper', [
    'ngResource', 'ngRoute', 'ngCookies',
    'ngTagsInput', 'ngFileUpload', 'oc.lazyLoad',
    'relativeDate', 'wysiwyg.module', 'angular-quill','VideoAnnotations','SlideViewerAnnotationZones']);
;app.config(['$routeProvider', '$locationProvider',

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

            otherwise({
                redirectTo: '/'
            });

    }]);
;app.controller('CategoryListController', function($scope, $http, $rootScope) {

    $http.get('/api/categories').success(function (data) {
        $scope.categories = data.categories;
    });

    $scope.$on('sidebarInit', function (ngRepeatFinishedEvent) {
        $.AdminLTE.tree('.sidebar');
    });

});
;app.controller('CourseController', function($scope, $rootScope, $filter, $http, $location, $routeParams, $timeout) {
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

            if ($scope.course.createdBy == $rootScope.user._id) {
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
;
app.controller('CourseEditController', function($scope, $filter, $http, $location, Upload) {
    $scope.createdDate = new Date();
    $scope.courseEdit = null;
    $scope.tagsRaw = [];
    $scope.files = [];
    $scope.filespicture = [];
    $scope.filesvideo = [];

    $scope.isLoading = false;
    $scope.errors = [];

    $scope.$on('onAfterInitCourse', function(event, course){
        $scope.init();
    });

    $scope.init = function(){
        $scope.tagsRaw = [];

        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);

        if($scope.courseEdit)
        if($scope.courseEdit.courseTags && $scope.courseEdit.courseTags.length > 0){
            for(var i in $scope.courseEdit.courseTags) {
                var t = $scope.courseEdit.courseTags[i];
                $scope.tagsRaw.push( {"text": t.name} );
            }
        }
    };

    $scope.saveCourse = function() {
        if($scope.tagsRaw) {
            $scope.courseEdit.tags = JSON.stringify($scope.tagsRaw);
        }

        var uploadParams = {
            url: '/api/course/' + $scope.courseEdit._id,
            fields: {
                name: $scope.courseEdit.name,
                description: $scope.courseEdit.description,
                tags: $scope.courseEdit.tags,
            }
        };

        uploadParams.file = [];
        // we only take one pdf file
        if ($scope.filespicture && $scope.filespicture.length){
            uploadParams.file.push($scope.filespicture[0]);
        }
        // we only take one vid file
        if ($scope.filesvideo && $scope.filesvideo.length){
            uploadParams.file.push($scope.filesvideo[0]);
        }

        $scope.isLoading = true;
        Upload.upload(
            uploadParams

        ).progress(function (evt) {
            if(!evt.config.file)
                return;

            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);

        })
            .success(function (data) {
                $scope.$emit('onAfterEditCourse', data.course);

                $scope.filespicture = [];
                $scope.filesvideo = [];

                $scope.isLoading = false;
                $('#editView').modal('hide');
            })

            .error(function(){
                $scope.isLoading = false;
                $scope.errors = data.errors;
            });
    };

    $scope.cancel = function(){
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);
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
;app.controller('CourseListController', function($scope, $rootScope, $http, $routeParams, $location, $sce ) {
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

        // once we get the complete category structure, we operate by id
        $http.get('/api/category/' + $scope.category._id + '/courseTags').success(function(data) {
            $scope.courseTags = data.courseTags;
            $scope.availableTags = data.courseTags;

            $scope.initTagFromSearch();
        });
    });
});
;app.controller('MapController', function($scope, $http, $rootScope, $timeout, $sce, $location) {
    $scope.treeNodes = [];
    $scope.jsPlumbConnections = [];
    $scope.widgets = [];
    $scope.isTreeInitiated = false;
    $scope.isCurrentTabIsMap = false;

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
    $scope.findNode = function(obj, col, searchKey, searchValue){
        if(found)
            return found;

        for(var i in obj){
            var tn = obj[i];

            if(tn[searchKey] && tn[searchKey] == searchValue) {
                found = tn;
                return tn;
            }
            else if(tn[col] && tn[col].length > 0){
                // search again
                $scope.findNode(tn[col], col, searchKey, searchValue);
            }
        }

        if(found)
            return found;
    };

    $(document).ready(function(){
        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x:$scope.width/2, y: ($scope.height/2)-100};
    });

    /**
     * get all categories, recursived on the server
     */
    $scope.init = function(){
        // add hover to center instantiate on hover
        $('.center-course').mouseover(function(){
            $(this).find('ul').show();
        }).mouseout(function(){$(this).find('ul').hide()});

        // get node data
        $http.get('/api/treeNodes/course/' + $scope.course._id ).success(function (data) {
            if(!data.result)
                console.log(data.errors);
            else
                if(data.treeNodes.length > 0) {
                    $scope.treeNodes = data.treeNodes;
                } else {
                    $scope.initJSPlumb();
                }
        });
    };

    $scope.$on('onAfterInitCourse', function(event, course){
        $scope.course = course;
        $scope.init();
    });

    // initiate draggable jqUI to the topic node
    $scope.initDraggable = function (jsPlumbInstance){
        var w = window.innerWidth;
        var h = window.innerHeight;

        // let us drag and drop the cats
        var mapEl = jsPlumb.getSelector(".course-map .w");
        jsPlumbInstance.draggable(mapEl,{
            // update position on drag stop
            stop: function() {
                var el = $(this);
                var pos = el.position();
                var distanceFromCenter = {
                    x: pos.left - Canvas.w/2,
                    y: pos.top - Canvas.h/2
                };

                var nId = el.attr('id').substring(1); // remove 't' from the node id
                found = false;
                var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nId);

                $http.put('/api/treeNodes/' + nId + '/positionFromRoot', distanceFromCenter)
                    .success(function(res, status){
                        console.log(res);
                        if(pNode)
                            pNode.positionFromRoot = distanceFromCenter;
                    })
                    .error(function(res, status){
                        console.log('err');
                        console.log(res);
                    });
            }
        });
    };

    $scope.initJSPlumb = function(){
        console.log('drawing tree');
        Tree.init(Canvas.w, Canvas.h);

        var instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            ConnectionOverlays: [ ],
            Container: "course-map"
        });

        $scope.initDraggable(instance);

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.treeNodes, instance);
        });
    };

    $scope.interConnect = function(parent, treeNodes, instance){
        // added "t" in id because id cannot start with number
        for(var i in treeNodes){
            var child = treeNodes[i];
            var childId = 't' + child._id;

            // instantiate on hover
            $('#' + childId).mouseover(function(){
                $(this).find('ul').show();
                $rootScope.$broadcast('onTopicHover', $(this).attr('id'));

            }).mouseout(function(){
                $(this).find('ul').hide();
                $rootScope.$broadcast('onTopicHoverOut', $(this).attr('id'));
            });

            // connecting parent and chidlern
            var conn = instance.connect({
                source: parent, target: childId,
                anchors: [
                    [ "Perimeter", { shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape") }],
                    [ "Perimeter", { shape: jsPlumb.getSelector('#' + childId)[0].getAttribute("data-shape") }]
                ]
            });

            $scope.jsPlumbConnections.push(conn);

            if(child.childrens) {
                $scope.interConnect(childId, child.childrens, instance);
            }
        }
    };

    $scope.goToDetail = function(categorySlug){
        window.location.href = "/courses/#/category/" + categorySlug;
    };

    $scope.nodeModaltitle = "";
    $scope.currentNodeAction = {};
    $scope.setMode = function(mode, type, parent){
        switch(mode){
            case 'add':
                $scope.currentNodeAction.mode = "Add";
                break;
            case 'edit':
                $scope.currentNodeAction.mode = "Edit";
                break;
        }

        switch(type){
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

        if(parent) {
            $scope.currentNodeAction.parent = parent;
            $scope.nodeModaltitle += " under " + parent.name;
        }
        else
            $scope.currentNodeAction.parent = false;

        $rootScope.$broadcast('onAfterSetMode', $scope.$parent.course);
    };

    $scope.$watch(function(){ return $location.search() }, function(newVal, oldVal){
        var currentTab = $location.search().tab;
        if(currentTab == 'map'){
            $scope.isCurrentTabIsMap = true;
        }
    }, true);

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        $scope.isTreeInitiated = true;
    });

    $scope.$watchGroup(['isTreeInitiated', 'isCurrentTabIsMap'], function(oldVal, newVal){
        if($scope.isTreeInitiated === true && $scope.isCurrentTabIsMap === true) {
            $scope.initJSPlumb();
        }
    });

    $scope.$on('onAfterCreateNode', function(event, treeNode){
        if(treeNode.parent) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode.parent);

            if(pNode) {
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
            function(){
                $scope.$apply();
                $scope.initJSPlumb();
            });
    });

    $scope.$on('onAfterEditNode', function(event, treeNode){
        if(treeNode) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode._id);
            if(pNode) {
                pNode.name = treeNode.name;
            }
        }

        $timeout(
            function(){
                $scope.$apply();
            });
    });

    /**
     * remove all svg generated by js plumb.
     */
    $scope.destroyJSPlumb = function(){
        for(var i in $scope.jsPlumbConnections){
            var conn = $scope.jsPlumbConnections[i];
            jsPlumb.detach(conn);
        }

        $scope.jsPlumbConnections = [];
    };

    $scope.resourceIcon = function(filetype){
        switch(filetype){
            case 'pdf':
                return 'fa fa-file-pdf-o';

            case 'mp4':
                return 'fa fa-file-video-o';

            case 'video':
                return 'fa fa-file-video-o';
        }
    };

    $scope.getDataShape = function(nodeType){
        if(nodeType == 'subTopic')
            return 'Ellipse';

        return 'Rectangle';
    };

    $scope.$on('onTopicHover', function(event, nodeId){
        if($scope.isRequesting)
            return;

        $scope.isRequesting = true;
        // the nodeId has "t", so we remove them first
        nodeId = nodeId.substring(1);
        $http.get('/api/server-widgets/node-icon-analytics/?nodeId=' + nodeId).success(
            function(res){
                $scope.isRequesting = false;
                if(res.result){
                    $scope.widgets[nodeId] = $sce.trustAsHtml(res.widgets);
                }
            }
        ).error(function(){
            $scope.isRequesting = false;
        });
    });

    $scope.$on('onTopicHoverOut', function(event, slug){
        $scope.isRequesting = false;
    });

    $scope.getContentNodeLink = function(d){
        return '#/cid/' + $scope.$parent.course._id + '/nid/' + d._id;
    };

    $scope.deleteNode = function(data){
        var msg = '';
        if(data.type == 'subTopic') {
            msg = 'Are you sure you want to delete this sub topic?';
        }
        else{
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
                .success(function(res) {
                    console.log(res);
                    if(res.result){
                        data.isDeleted = true;
                        data.name = '[DELETED]';

                        $timeout(function(){$scope.$apply()});
                    } else {
                        if( data.result != null && !data.result){
                            $scope.errors = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        }
    }
});
;app.controller('NodeDetailController', function($scope, $rootScope, $filter, $http, $location, $routeParams, $timeout, ActionBarService) {
    $scope.course = null;
    $scope.user = null;
    $scope.treeNode = null;
    $scope.enrolled = false;
    $scope.loc = $location.absUrl() ;
    $scope.courseId = $routeParams.courseId;
    $scope.nodeId = $routeParams.nodeId;
    $scope.isOwner = false;
    $scope.isNodeOwner = false;
    $scope.isVideoExist = false;
    $scope.isPdfExist = false;
    $scope.videoFile = false;
    $scope.pdfFile = false;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $scope.currentTab = "video";
    $scope.tabs = {
        'video':'Video',
        'pdf':'Pdf',
        'analytics':'Analytics',
        'updates':'Updates',
        'links':'Links'
    };

    $scope.deleteNode = function(id){
        var msg = 'Are you sure you want to delete this content node?';

        if (confirm(msg)) {
            $http({
                method: 'DELETE',
                url: '/api/treeNodes/' + id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(res) {
                    console.log(res);
                    if(res.result){
                        //todo: go to map view
                        console.log("node deleted");
                        $location.path('/cid/' + $scope.courseId + '?tab=map');
                    } else {
                        if( data.result != null && !data.result){
                            $scope.errors = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        }
    };

    $scope.manageActionBar = function(){
        if(($scope.currentTab == 'video' || $scope.currentTab == 'pdf') && $scope.treeNode) {
            if (
                $scope.treeNode.createdBy == $rootScope.user._id) {

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

    $scope.changeTab = function(){
        var defaultPath = "video";
        var q = $location.search();

        if(q.tab){
            defaultPath = q.tab;
        } else {
            if($scope.isVideoExist && $scope.isPdfExist){
                jQuery('#video').addClass('active');
                jQuery('li.video').addClass('active');
            } else if($scope.isPdfExist){
                jQuery('#pdf').addClass('active');
                jQuery('li.pdf').addClass('active');
            } else {
                jQuery('#video').addClass('active');
                jQuery('li.video').addClass('active');
            }
        }

        $scope.currentTab = defaultPath;
        $scope.actionBarTemplate = 'actionBar-node-' + $scope.currentTab;

        $scope.manageActionBar();
    };

    $scope.currentNodeAction = {};
    $scope.setEditMode = function(){
        $scope.currentNodeAction.mode = "edit";
        $scope.currentNodeAction.type = "contentNode";
        $scope.currentNodeAction.typeText = "Content Node";
        $scope.currentNodeAction.parent = $scope.treeNode;

        $scope.nodeModaltitle = "Edit " + $scope.currentNodeAction.typeText;

        $rootScope.$broadcast('onAfterSetMode', $scope.course, $scope.treeNode);
    };

    $scope.initNode = function(){
        $http.get('/api/treeNode/' + $scope.nodeId).success(function(res){
            if(res.result) {
                $scope.treeNode = res.treeNode;

                if ($scope.treeNode.createdBy == $rootScope.user._id) {
                    $scope.isNodeOwner = true;
                    $scope.setEditMode();
                }

                for(var i = 0;i < $scope.treeNode.resources.length; i++){
                    var content = $scope.treeNode.resources[i];
                    if(content['type'] == 'mp4' || content['type'] == 'video'){
                        $scope.isVideoExist = true;
                        $scope.videoFile = content;
                    } else if(content['type'] == 'pdf'){
                        $scope.pdfFile = content;
                        $scope.isPdfExist = true;
                    }
                }

                $scope.changeTab();

                $timeout(function(){
                    $scope.$broadcast('onAfterInitTreeNode', $scope.treeNode);
                });
            }
        });
    };

    $scope.init = function(){
        $http.get('/api/course/' + $scope.courseId).success(function(res){
            if(res.result) {
                $scope.course = res.course;

                $scope.initNode();

                $timeout(function(){
                    $scope.$broadcast('onAfterInitCourse', $scope.course);
                });
            }
        });

        $scope.changeTab();
    };

    $scope.init();

    $rootScope.$watch('user', function(){
        if($rootScope.user) {
            $scope.user = $rootScope.user;
        }
    });

    $scope.$watchGroup(['user', 'course'], function(){
        if($scope.user != null && $scope.course != null) {
            $http.get('/api/accounts/' + $scope.user._id + '/course/' + $scope.courseId).success(function (res) {
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

    $scope.$on('$routeUpdate', function(){
        $scope.changeTab();
    });
});;app.controller('NodeEditController', function($scope, $http, $rootScope, Upload) {

    $scope.formData = {};
    $scope.filespdf = [];
    $scope.filesvideo = [];
    $scope.currentEditNode = false;

    $scope.isLoading = false;
    $scope.errors = [];

    $scope.init = function(){
    };

    $scope.$on('onAfterSetMode', function(event, course, treeNode){
        $scope.formData.courseId = course._id;

        if($scope.currentNodeAction.parent)
            $scope.formData.parent = $scope.currentNodeAction.parent._id;

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
                    }
                    $scope.formData.name = "";

                    $scope.isLoading = false;
                    $scope.addSubTopicForm.$setPristine();
                }
            })
            .error(function(data){
                $scope.errors = data.errors;
                $scope.isLoading = false;
            })
        ;
    };

    /**
     * save edit sub topic node
     * and saving edit of content node
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

                    $('#editSubTopicModal').modal('hide');
                    $('#editContentNodeModal').modal('hide');

                    $scope.editSubTopicForm.$setPristine();
                }
            })
            .error(function(data){
                $scope.isLoading = false;
                $scope.errors = data.errors;
            });
    };

    /**
     * save add content node
     */
    $scope.saveContentNode = function(isValid){
        if(!isValid)
            return;

        // use saveEditNode for editing the content node.
        if($scope.currentNodeAction.mode == 'edit'){
            $scope.saveEditNode();
            return;
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

        Upload.upload(
            uploadParams

        ).progress(function (evt) {
                if(!evt.config.file)
                    return;

                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);

            }).success(function (data, status, headers, config) {
                console.log(data);

                if(data.result) {
                    data.treeNode['resources'] = [];
                    for(var i in uploadParams.file){
                        var f = uploadParams.file[i];
                        var resTemp = $scope.parseNgFile(f);
                        data.treeNode['resources'].push(resTemp);
                    }

                    $rootScope.$broadcast('onAfterCreateNode', data.treeNode);

                    $('#addSubTopicModal').modal('hide');
                    $('#addContentNodeModal').modal('hide');

                    // cleaining up formData
                    $scope.formData.name = "";
                    $scope.filespdf = [];
                    $scope.filesvideo = [];

                    if($scope.formData.parent)
                        delete $scope.formData.parent;

                }

                $scope.addContentNodeForm.$setPristine();
                $scope.isLoading = false;
            })
            .error(function(data){
                $scope.isLoading = false;
                $scope.errors = data.errors;
            });

    };

    $scope.cancel = function(){
        $scope.currentEditNode.name = $scope.currentEditNodeOriginal.name;
    }
});
;app.directive('comment',
    function ($compile) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                postedBy: '@',
                postedDate: '@',
                postContent: '=',
                isPostOwner: '=',
                isDeleted: '=',
                postId:'@',
                editAction: '&',
                deleteAction: '&'
            },

            templateUrl: '/angular/views/discussion.reply.html'/*,

            controller: function ($scope, $compile, $http, $attrs) {

            },

            link: function(scope, element, attrs) {
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
});;app.directive('cancel',
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
    });;app.directive('movable', function () {
    return {
        restrict: 'A',
        scope: {
            onMoved: '=',
            canMove: '@'
        },
        link: function (scope, element, attrs) {
            attrs.$observe('canMove', function (value) {
                if (value === 'false') {
                    console.log('Disabling draggable and resizable');
                    element.draggable({
                        disabled: true
                    }).resizable({
                        disabled: true
                    });
                } else {
                    console.log('Enabling draggable and resizable');
                    element.draggable({
                        disabled: false
                    }).resizable({
                        disabled: false
                    });
                }
            });

            var getPosition = function (ui) {
                var position = {
                    left: Math.round((100 * ui.position.left / element.parent()[0].clientWidth)),
                    top: Math.round((100 * ui.position.top / element.parent()[0].clientHeight))
                };
                console.log(position);
                return position;
            };
            console.log('Initializing draggable and resizable');
            element
                .draggable({
                    containment: 'parent',
                    cursor: 'move',
                    stop: function (event, ui) {
                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getPosition(ui)
                            });
                        }
                    }
                })
                .resizable({
                    containment: 'parent',
                    handles: 'ne, se, sw, nw',
                    stop: function (event, ui) {
                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getPosition(ui),
                                size: ui.size
                            });
                        }
                    }
                });

            // remove event handlers
            scope.$on('$destroy', function () {
                element.off('**');
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
            '<i class="ionicons ion-chevron-up" ng-show="(voteValue == 1)"></i>' +
            '</div></a>' +
            '<div class="vote-total">{{voteDisplay}}</div>' +
            '<a class="cursor"><div class="btn-down" ng-class="getClassDown()" ng-click="sendVote(\'down\')">' +
            '<i class="ionicons ion-ios-arrow-down" ng-hide="(voteValue == -1)"></i>' +
            '<i class="ionicons ion-chevron-down" ng-show="(voteValue == -1)"></i>' +
            '</div></a>' +
            '</div>',

            controller: function ($scope, $compile, $http, $attrs) {
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
                        //data: d,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })
                        .success(function (data) {
                            console.log(data);
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

                                $scope.voteDisplay = $scope.voteTotal + $scope.voteValue;
                            }

                            $scope.isLoading = false;
                        })
                        .error(function (data) {
                            $scope.isLoading = false;
                            $scope.errors = data.errors;
                        });
                };
            }

        };
    });;app.controller('DiscussionController', function($scope, $rootScope, $http, $location, $sce, $compile, ActionBarService, $timeout) {
    $scope.formData = {};
    $scope.course = {};
    $scope.currentReplyingTo = false;
    $scope.currentEditPost = {};
    $scope.currentTopic = false;
    $scope.originalCurrentTopic = {};

    $scope.pid = false;

    $scope.isLoading = false;
    $scope.errors = [];

    $scope.menu = [
        ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
        [ 'font-size' ],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['code', 'quote', 'paragraph']
    ];

    $scope.topics = [];
    $scope.replies = [];

    $scope.initiateTopic = function(){
        $scope.pid = $location.search().pid;

        if($scope.pid) {
            $scope.getReplies($scope.pid);
        }

        $scope.manageActionBar();
    };

    $scope.$on('onAfterInitCourse', function(e, course){
        $scope.course= course;

        $http.get('/api/discussions/' + course._id).success(function(res){
           if(res.result && res.posts){
               $scope.topics = res.posts;

               $scope.initiateTopic();
           }
        });
    });

    $scope.$on('onAfterCreateReply', function(e, reply){
        if(reply){
            reply.createdBy = $rootScope.user;
            $scope.replies.unshift(reply);
        }
    });

    $scope.saveNewPost = function(isValid){
        if(!isValid)
            return;

        console.log('saving');

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
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    $scope.$emit('onAfterCreateNewTopic', data.post);
                    $scope.topics.unshift(data.post);
                    $timeout(function(){$scope.$apply()});

                    $('#addNewTopicModal').modal('hide');
                }

                $scope.addTopicForm.$setPristine();
                $scope.isLoading = false;
            })
            .error(function(data){
                $scope.errors = data.errors;
                $scope.isLoading = false;
            });
    };

    $scope.saveEditPost = function(isValid){
        if(!isValid)
            return;

        console.log('saving edit post');

        var d = transformRequest($scope.currentTopic);
        $http({
            method: 'PUT',
            url: '/api/discussion/' + $scope.currentTopic._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    $scope.$emit('onAfterEditTopic', data.post);

                    $('#editTopicModal').modal('hide');

                    var i = _.findIndex($scope.topics, { 'discussion': {'_id' : data.post._id}});
                    $scope.topics[i].discussion = data.post;
                    $timeout(function(){$scope.$apply()});

                    $scope.editTopicForm.$setPristine();
                    $scope.isLoading = false;
                }
            })
            .error(function(data){
                $scope.errors = data.errors;
                $scope.isLoading = false;
            });
    };

    $scope.editReply = function(re){
        $scope.currentEditPost = re;
        $scope.$broadcast('onEditReplyClicked', re);
    };

    $scope.deletePost = function(postId){
        $http({
            method: 'DELETE',
            url: '/api/discussion/' + postId,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    $scope.$emit('onAfterDeletePost', postId);

                } else {
                    if( data.result != null && !data.result){
                        $scope.errorName = data.errors;
                        console.log(data.errors);
                    }
                }
            }) ;
    };

    $scope.deleteTopic = function(postId){
        var r = confirm("Are you sure you want to delete this topic?");

        if (r == true) {
            $http({
                method: 'DELETE',
                url: '/api/discussions/' + $scope.course._id +'/topic/' + postId,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterDeleteTopic', postId);

                    } else {
                        if( data.result != null && !data.result){
                            $scope.errorName = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        }
    };

    $scope.$on('$routeUpdate', function(){
        $scope.initiateTopic();
    });

    $scope.$on('onAfterCreateNewTopic', function(e, f){
        $scope.formData.title = "";
        $scope.formData.content = "";
    });

    $scope.$on('onAfterEditReply', function(e, f){
        var i = _.findIndex($scope.replies, { '_id' : f._id});
        $scope.replies[i].content = f.content;
        $timeout(function(){
            $scope.$apply();
        });
    });

    $scope.$on('onAfterDeletePost', function(e, postId){
        var i = _.findIndex($scope.replies, { '_id' : postId});
        $scope.replies[i].content = '[DELETED]';
        $timeout(function(){
            $scope.$apply();
        });
    });

    $scope.$on('onAfterDeleteTopic', function(e, postId){
        var i = _.findIndex($scope.topics, { discussion: { '_id' : postId}});
        //$scope.topics[i].isDeleted = true;
        if(i >= 0) {
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

    $scope.manageActionBar = function(){
        if($scope.$parent.currentTab != 'discussion')
            return;

        if($scope.pid){
            ActionBarService.extraActionsMenu = [];

            ActionBarService.extraActionsMenu.push({
                separator: true
            });

            ActionBarService.extraActionsMenu.push(
                {
                    'html':
                    '<a style="cursor: pointer;"' +
                    ' data-toggle="modal" data-target="#addNewReplyModal"' +
                    ' title="Reply">' +
                    '&nbsp;&nbsp; <i class="ionicons ion-reply"></i> &nbsp; REPLY</a>'
                }
            );

            if($scope.currentTopic && $scope.currentTopic.createdBy &&
                $scope.currentTopic.createdBy._id == $rootScope.user._id) {

                ActionBarService.extraActionsMenu.push({
                    'html':
                    '<a style="cursor: pointer;"' +
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
        else if(!$scope.pid){
            $scope.currentTopic = {};
            ActionBarService.extraActionsMenu = [];
        }
    };

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.$watch('currentTopic', function(oldVal, newVal){
            if(oldVal !== newVal) {
                if ($scope.currentTopic && $scope.currentTopic._id) {
                    //$scope.manageActionBar();
                }
            }
        });
    });

    $scope.getReplies = function(postId){
        var i = _.findIndex($scope.topics, { 'discussion': {'_id' : postId}});
        if($scope.topics[i]){
            $scope.currentTopic = cloneSimpleObject($scope.topics[i].discussion);
            $scope.currentTopic.createdBy = $scope.topics[i].createdBy;

            $scope.originalCurrentTopic = cloneSimpleObject($scope.topics[i].discussion);

            $scope.currentReplyingTo = $scope.currentTopic._id;

            $http.get('/api/discussion/' + postId + '/posts').success(function(res){
                if(res.result){
                    $scope.replies = res.posts;
                }
            });
        }
    };

    $scope.cancel = function(){
        $scope.currentTopic = $scope.originalCurrentTopic;
        $scope.editTopicForm.$setPristine();
        $scope.addTopicForm.$setPristine();
        $scope.errors = [];
    };

});;app.controller('ReplyController', function ($scope, $http, $timeout) {
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

    $scope.menu = [
        ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
        ['font-size'],
        ['ordered-list', 'unordered-list', 'outdent', 'indent'],
        ['left-justify', 'center-justify', 'right-justify'],
        ['code', 'quote', 'paragraph']
    ];

    $scope.$on('onEditReplyClicked', function (e, post) {
        $scope.EditFormData.content = post.content;
        $scope.EditFormData.postId = post._id;
    });

    $scope.saveNewReply = function (isValid) {
        if (!isValid)
            return;

        console.log('saving reply to ' + $scope.$parent.currentReplyingTo);
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
                }
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.isLoading = false;
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

        console.log('saving edit reply ' + $scope.$parent.currentEditPost._id);

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
                console.log(data);
                if (data.result) {
                    $scope.$emit('onAfterEditReply', data.post);

                    $scope.EditFormData.content = "";
                    $timeout(function () {
                        $scope.$apply()
                    });
                    $('#editReplyModal').modal('hide');
                }

                $scope.editReplyForm.$setPristine();
                $scope.isLoading = false;
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.isLoading = false;
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
                console.log(data);
                if (data.result) {
                    $scope.$emit('onAfterDeletePost', postId);

                } else {
                    if (data.result != null && !data.result) {
                        $scope.errorName = data.errors;
                        console.log(data.errors);
                    }
                }
            });
    };

});;app.factory('authService', [
    '$rootScope', '$http',

    function($rootScope, $http) {
        return {

            loginCheck : function(successCallback){
                $http.get('/api/accounts').success(function(data) {
                    if(data.result) {
                        $rootScope.user = data.user;

                        $rootScope.$broadcast('onAfterInitUser', $rootScope.user);

                        successCallback($rootScope.user);
                    }
                });
            },

            login: function(loginData, successCallback, errorCallback){
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
                        if(data.result) {
                            $rootScope.user = data.user;

                            $rootScope.$broadcast('onAfterInitUser', $rootScope.user);

                            successCallback($rootScope.user);
                        }
                    }).error(
                    function (data) {
                        errorCallback(data);
                    }
                );
            }
        }
    }
]);;app.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});;app.filter('capitalize', function() {
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

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });;(function(){"use strict";angular.module("relativeDate",[]).value("now",null).value("relativeDateTranslations",{just_now:"just now",seconds_ago:"{{time}} seconds ago",a_minute_ago:"a minute ago",minutes_ago:"{{time}} minutes ago",an_hour_ago:"an hour ago",hours_ago:"{{time}} hours ago",a_day_ago:"yesterday",days_ago:"{{time}} days ago",a_week_ago:"a week ago",weeks_ago:"{{time}} weeks ago",a_month_ago:"a month ago",months_ago:"{{time}} months ago",a_year_ago:"a year ago",years_ago:"{{time}} years ago",over_a_year_ago:"over a year ago",seconds_from_now:"{{time}} seconds from now",a_minute_from_now:"a minute from now",minutes_from_now:"{{time}} minutes from now",an_hour_from_now:"an hour from now",hours_from_now:"{{time}} hours from now",a_day_from_now:"tomorrow",days_from_now:"{{time}} days from now",a_week_from_now:"a week from now",weeks_from_now:"{{time}} weeks from now",a_month_from_now:"a month from now",months_from_now:"{{time}} months from now",a_year_from_now:"a year from now",years_from_now:"{{time}} years from now",over_a_year_from_now:"over a year from now"}).filter("relativeDate",["$injector","now","relativeDateTranslations",function(a,b,c){var d,e;return d=a.has("$translate")?a.get("$translate"):{instant:function(a,b){return c[a].replace("{{time}}",b.time)}},e=function(a,b){return Math.round(Math.abs(a-b)/1e3)},function(a){var c,f,g,h,i,j,k,l,m;switch(j=b?b:new Date,a instanceof Date||(a=new Date(a)),f=null,h=60,g=60*h,c=24*g,l=7*c,i=30*c,m=365*c,f=e(j,a),f>c&&l>f&&(a=new Date(a.getFullYear(),a.getMonth(),a.getDate(),0,0,0),f=e(j,a)),k=function(b,c){var e;return e="just_now"===b?b:j>=a?""+b+"_ago":""+b+"_from_now",d.instant(e,{time:c})},!1){case!(30>f):return k("just_now");case!(h>f):return k("seconds",f);case!(2*h>f):return k("a_minute");case!(g>f):return k("minutes",Math.floor(f/h));case 1!==Math.floor(f/g):return k("an_hour");case!(c>f):return k("hours",Math.floor(f/g));case!(2*c>f):return k("a_day");case!(l>f):return k("days",Math.floor(f/c));case 1!==Math.floor(f/l):return k("a_week");case!(i>f):return k("weeks",Math.floor(f/l));case 1!==Math.floor(f/i):return k("a_month");case!(m>f):return k("months",Math.floor(f/i));case 1!==Math.floor(f/m):return k("a_year");default:return k("over_a_year")}}}])}).call(this);;app.filter('secondsToDateTime', [function() {
    return function(seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
    };
}]);;app.
    controller('LinksController', function($scope, $rootScope, $http, $location, $sce, $compile, ActionBarService, $timeout) {
        $scope.formData = {};
        $scope.course = {};
        $scope.contentNode = {};
        $scope.currentLink = false;
        $scope.originalCurrentLink = {};
        $scope.pid = false;
        $scope.currentLinkUrl = "";
        $scope.links = [];
        $scope.errors = [];
        $scope.isLoading = false;

        $scope.initiateLink = function(){
            $scope.pid = $location.search().pid;
            $scope.manageActionBar($scope.pid);

            if($scope.pid) {
                $scope.setCurrentLink($scope.pid)
            }
        };

        $scope.$on('onAfterInitTreeNode', function(e, contentNode){
            $scope.contentNode = contentNode;

            $http.get('/api/links/' + contentNode._id).success(function(res){
               if(res.result && res.posts){
                   $scope.links = res.posts;

                   $scope.initiateLink();
               }
            });
        });

        $scope.$on('onAfterInitCourse', function(e, course){
            $scope.course = course;
        });

        $scope.saveNewPost = function(isValid){
            if(!isValid)
                return;

            console.log('saving bookmark');

            $scope.isLoading = true;

            var d = transformRequest($scope.formData);
            $http({
                method: 'POST',
                url: '/api/links/' + $scope.contentNode._id,
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterCreateNewLink', data.post);
                        $scope.links.unshift(data.post);
                        $timeout(function(){$scope.$apply()});

                        $scope.formData = {};
                        $scope.AddLinkForm.$setPristine();

                        $('#AddLinksModal').modal('hide');
                    }

                    $scope.isLoading = false;
                })
                .error(function(data){
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                });
        };

        $scope.saveEditPost = function(isValid){
            if(!isValid)
                return;

            console.log('saving edit bookmark');

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
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterEditLinks', data.post);

                        $('#EditLinksModal').modal('hide');

                        var i = _.findIndex($scope.links, { 'link': {'_id' : data.post._id}});
                        $scope.links[i].link = data.post;
                        $timeout(function(){$scope.$apply()});
                    }

                    $scope.AddLinkForm.$setPristine();
                    $scope.isLoading = false;
                })
                .error(function(data){
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                });
        };

        $scope.deletePost = function(postId){
            var r = confirm("Are you sure you want to delete this link?");

            if (r == true) {
                $http({
                    method: 'DELETE',
                    url: '/api/links/' + $scope.contentNode._id + '/link/' + postId,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                    .success(function(data) {
                        console.log(data);
                        if(data.result) {
                            $scope.$emit('onAfterDeleteLink', postId);

                        } else {
                            if( data.result != null && !data.result){
                                $scope.errorName = data.errors;
                                console.log(data.errors);
                            }
                        }
                    }) ;
            }
        };

        $scope.$on('$routeUpdate', function(){
            $scope.initiateLink();
        });

        $scope.$on('onAfterDeleteLink', function(e, postId){
            var i = _.findIndex($scope.links, { link: { '_id' : postId}});
            if(i>=0) {
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

        $scope.manageActionBar = function(){
            if($scope.$parent.currentTab != 'links')
                return;

            if($scope.pid){
                ActionBarService.extraActionsMenu = [];
                ActionBarService.extraActionsMenu.unshift({
                    separator: true
                });
            }
            else if(!$scope.pid){
                $scope.currentLink = {};
                ActionBarService.extraActionsMenu = [];
            }
        };

        $scope.$on('onAfterInitUser', function(event, user){
            $scope.$watch('currentLink', function(oldVal, newVal){
                if($scope.currentLink && $scope.currentLink.createdBy &&
                    $scope.currentLink.createdBy._id == $rootScope.user._id) {

                    ActionBarService.extraActionsMenu.push({
                        'html':
                        '<a style="cursor: pointer;"' +
                        ' data-toggle="modal" data-target="#EditLinksModal"' +
                        ' title="Edit">' +
                        '&nbsp;&nbsp; <i class="ionicons ion-edit"></i> &nbsp; EDIT</a>'
                    });

                    ActionBarService.extraActionsMenu.push({
                        clickAction: $scope.deletePost,
                        clickParams: $scope.currentLink._id,
                        title: '<i class="ionicons ion-close"></i> &nbsp;DELETE',
                        aTitle: 'DELETE'
                    });
                }
            });
        });

        $scope.setCurrentLink = function(postId){
            var i = _.findIndex($scope.links, { 'link': {'_id' : postId}});
            if($scope.links[i]){
                $scope.currentLink = cloneSimpleObject($scope.links[i].link);
                $scope.currentLink.createdBy = $scope.links[i].createdBy;
                $scope.originalCurrentLink = cloneSimpleObject($scope.links[i].link);
                $scope.currentLinkUrl = $sce.trustAsResourceUrl($scope.currentLink.content);
            }
        };

        $scope.cancel = function(){
            $scope.currentLink = $scope.originalCurrentLink;
            if($scope.AddLinkForm)
            $scope.AddLinkForm.$setPristine();
            if($scope.EditLinkForm)
            $scope.EditLinkForm.$setPristine();
        };

        $scope.getSrc = function(url) {
            return $sce.trustAsResourceUrl(url);
        };

    });;app.controller('PDFNavigationController', function($scope, $http, $rootScope, $sce, $timeout) {
    $scope.currentPageNumber = 1;
    $scope.maxPageNumber = 30;

    $scope.changePageNumber = function(value){
      //console.log("GOT CALLED");
      if( ($scope.currentPageNumber + value) <= $scope.maxPageNumber && ($scope.currentPageNumber + value) >= 1)
        $scope.currentPageNumber = $scope.currentPageNumber + value;
        $timeout(function(){
          $scope.$apply();
          pdfIsLoaded = false;
          changeSlide($scope.currentPageNumber);
        });

    }


});
;app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout, $injector) {

    $scope.storedAnnZones = [];
    $scope.storedAnnZoneColors = [];

    /*$scope.$watchCollection("storedAnnZones",function(newValue,oldValue){
      console.log($scope.storedAnnZones);
    });*/



    $scope.refreshTags = function() {
      $http.get('/slide-viewer/disAnnZones/1/'+$scope.currentPageNumber).success(function (data) {
        //console.log('TAGS UPDATED OF PAGE ' + $scope.currentPageNumber);
        $scope.annZones = data.annZones;

        tagListLoaded($scope.annZones);

        $timeout(function(){
          $scope.$apply();
        });


        /*$scope.$on('$stateChangeSuccess', function(){
          console.log("ALL DONE AJS");
        });
        */

      });
    };

    $scope.$watch("currentPageNumber",function(newValue,oldValue){
      //console.log("LOADED RESET");
      $(".slideRect").remove();

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];
      $scope.refreshTags();
    });

    $scope.compileMovableAnnotationZone = function(element) {
      return angular.element(
        $injector.get('$compile')(element)($scope)
      );
    };

    //$scope.refreshTags();
});
;app.controller('CommentListController', function($scope, $http, $rootScope, $sce, $timeout) {

    $scope.currentUser = "";
    $rootScope.$watch('user', function(){
          if($rootScope.user) {
              $scope.currentUser = $rootScope.user;
          }
      });


    $scope.orderType = "author";
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = '';
    //$scope.pageFilter;


    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;


    function updateScope(url){
      $http.get(url).success(function (data) {
        //console.log('COMMENTS UPDATED');
        //console.log("url: " + url);

        $scope.comments = data.comments;

        for(var i in $scope.comments){
          var cmnt = $scope.comments[i];
          cmnt.html = $sce.trustAsHtml(cmnt.html);

          $timeout(function(){
            $scope.$apply();
            commentsLoaded();
          });
        };
      });
    };

    function getCurrentFilters(filtersRaw){
      var finalFilters;
      /*if($scope.filtersRaw.length == 0)
        finalFilters='{}';
      else {*/
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
        }
        if(!isNaN($scope.currentPageNumber))
          finalFilters = finalFilters + '"pdfPageNumber":"' + $scope.currentPageNumber + '"';
        finalFilters = finalFilters + '}';

      //}
      //console.log("Final Filters: " + finalFilters);
      return finalFilters;
    }


    $scope.$watch("orderType",function(newValue,oldValue){
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("ascending",function(newValue,oldValue){
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("filtersRaw",function(newValue,oldValue){
      //console.log("NOTICED FILTERS CHANGE");
      $scope.filters = getCurrentFilters($scope.filtersRaw);
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      //console.log("commentGetUrl: " + $scope.commentGetUrl);
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("currentPageNumber",function(newValue,oldValue){
      $scope.filters = getCurrentFilters($scope.filtersRaw);
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      //console.log("commentGetUrl: " + $scope.commentGetUrl);
      updateScope($scope.commentGetUrl);
    });





    /*$http.get('/slide-viewer/disComm').success(function (data) {
        console.log(data);
        $scope.comments = data.comments;

        for(var i in $scope.comments){
            var cmnt = $scope.comments[i];
            cmnt.html = $sce.trustAsHtml(cmnt.html);
        }


        $scope.loadComments = function (orderType, ascending, filters) {
          //var url = '/slide-viewer/disComm/{"type":"'+ orderType + '","ascending":"' + ascending + '"}/' + filters;
          var url = '/slide-viewer/disComm/{"type":"'+ orderType + '","ascending":"' + ascending + '"}/{"author":"Kaet"}';
          console.log(url);
          $http.get(url).success(function (data) {
              console.log(data);
              $scope.comments = data.comments;

              for(var i in $scope.comments){
                  var cmnt = $scope.comments[i];
                  cmnt.html = $sce.trustAsHtml(cmnt.html);
              }

          });




        };
    });*/

});
;app.controller('HomePageController', function($scope, $http, $rootScope, $sce) {
    $scope.hideSlider = false;
    $scope.isRequesting = false;
    $scope.widgets = [];

    $(document).ready(function(){
        if(typeof(localStorage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            if(localStorage.hideSlider){
                $scope.hideSlider = localStorage.hideSlider;
            }
        }

        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x:$scope.width/2, y: ($scope.height/2)-100};
    });

    /**
     * get all categories, recursived on the server
     */
    $http.get('/api/categories').success(function (data) {
        if(data.categories) {
            $scope.categories = data.categories;
        }
        else
            $scope.categories = false;
    });

    $scope.setHideSlider = function(){
        $scope.hideSlider = true;
        if(typeof(localStorage) !== "undefined")
            localStorage.hideSlider = true;
    };

    $scope.$watch('hideSlider', function(){
        if($scope.hideSlider){
            //$scope.initJSPlumb();
        }
    });

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        console.log(ngRepeatFinishedEvent);
        $scope.initJSPlumb();
    });

    $scope.initJSPlumb = function(){
        Tree.init(Canvas.w, Canvas.h);

        var instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            ConnectionOverlays: [ ],
            Container: "category-map"
        });

        // so the ejs can access this instance
        $rootScope.initDraggable(instance);

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.categories, instance);
        });
    };

    $scope.interConnect = function(parent, categories, instance){
        for(var i in categories){
            var child = categories[i];

            // instantiate on hover
            $('#' + child.slug).mouseover(function(event){
                $(this).find('ul').show();
                $rootScope.$broadcast('onCategoryHover', $(this).attr('id'));

            }).mouseout(function(){
                $(this).find('ul').hide();
                $rootScope.$broadcast('onCategoryHoverOut', $(this).attr('id'));
            });

            instance.connect({
                source: parent, target: child.slug,
                anchors: [
                    [ "Perimeter", { shape: jsPlumb.getSelector('#'+parent)[0].getAttribute("data-shape") }],
                    [ "Perimeter", { shape: jsPlumb.getSelector('#'+child.slug)[0].getAttribute("data-shape") }]
                ]
            });

            if(child.subCategories) {
                $scope.interConnect(child.slug, child.subCategories, instance);
            }
        }
    };

    $scope.$on('onCategoryHover', function(event, slug){
        if($scope.isRequesting)
            return;

        $scope.isRequesting = true;
        $http.get('/api/server-widgets/category-homepage/?slug=' + slug).success(
           function(res){
               $scope.isRequesting = false;
               if(res.result){
                    $scope.widgets[slug] = $sce.trustAsHtml(res.widgets);
               }
           }
       ).error(function(){
                $scope.isRequesting = false;
            });
    });

    $scope.$on('onCategoryHoverOut', function(event, slug){
        $scope.isRequesting = false;
    });

    $scope.goToDetail = function(categorySlug){
        window.location.href = "/courses/#/category/" + categorySlug;
    };

});
;app.controller('LoginPageController', function($scope, $http, $rootScope, $cookies, authService) {
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

});;app.controller('MainMenuController', function($scope, $http, $rootScope, $cookies, authService) {
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
                    if(!$scope.referer) {
                        window.location = '/accounts';
                    }
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
});;app.controller('staticController', function($scope, $http, $rootScope) {

});
;app.controller('UserEditController', function($scope, $http, $rootScope, $timeout) {
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
;app.controller('widgetController', function($scope, $http, $rootScope, $timeout) {
    $scope.location = "";
    $scope.widgets = [];

    $scope.initWidgetButton = function(id){
        $.AdminLTE.boxWidget.activate();
        $scope.addWidget(id);
    };

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.$watch('location', function(newVal, oldVal){
            if($scope.location == 'user-profile'){
                console.log('onAfterInitUser');
                $scope.getWidgets();
            }
        });
    });

    $scope.$on('onAfterInitCourse', function(event, course){
        console.log('onAfterInitCourse');
        $scope.course = course;
        $scope.getWidgets();
    });

    $scope.$watch('location', function(newVal, oldVal) {
        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();
            //for(var i in $scope.widgets){
            //    grid.remove_widget();
            //}

            $scope.getWidgets();
        });

        var onafter = 'onAfterUninstall' + $scope.location;
        $scope.$on( onafter, function(event, newWidget){
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets();
        });

        var onafterW = 'OnAfterWidgetLoaded' + $scope.location;
        $scope.$on(onafterW, function(){
            //$scope.initiateDraggableGrid($scope.location);
            //$scope.populateWidgets($scope.location);
        });
    });

    $scope.getWidgets = function(){
        var id = "";
        if($scope.location == 'user-profile')
            id = $rootScope.user._id;

        else if($scope.location == 'course-preview' || $scope.location == 'course-analytics')
            id = $scope.course._id;

        $http.get('/api/widgets/' + $scope.location + '/' + id).success(function (data) {
            $scope.widgets = data.widgets;

            $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, $scope.widgets);
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
        //for(var i in locs){
            //var loc = locs[i];

        var $gs = $(loc);
        $gs.gridstack(options);

        $gs.on('onStartMove', function (e, node) {
            curNode.x = node.x;
            curNode.y = node.y;
        });

        $gs.on('onMove', function (e, node) {
            console.log(node.x + " ++ " + node.y);
        });

        $gs.on('onFinishDrop', function (e, node) {
            var o = $(node.el);

            if(options.allowed_grids && options.allowed_grids.indexOf(node.x) < 0){
                o.attr('data-gs-x', curNode.x).attr('data-gs-y', curNode.y);
            }
            console.log("onFinishDrop");
            var wId = o.attr('id').substr(1);
            $scope.setPosition(wId, node.x, node.y);
        });
    };

    $scope.setPosition = function(wId, x, y){
        $http.put('/api/widget/' + wId + '/setPosition/', {
            x:x, y:y
        }).success(function(res){
            if(res.result)
                console.log('set position success');
        });
    };

    $scope.populateWidgets = function(){
        for(var i in $scope.widgets){
            $scope.addWidget($scope.widgets[i].widgetId._id);
        }
    }
});
;app.controller('WidgetGalleryController', function ($scope, $http, $rootScope, $ocLazyLoad, $timeout) {
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

    $scope.$watch('location', function(newVal, oldVal) {
        var onafter = 'onAfterGetWidgets' + $scope.location;
        $scope.$on(onafter, function (event, installedWidgets) {
            $scope.installedWidgets = installedWidgets;

            for(var i in $scope.installedWidgets){
                var wdg = $scope.installedWidgets[i];

                // loop to load the js (if exist)
                $ocLazyLoad.load('/' + wdg.application + '/' + wdg.application + '.js');
            }
        });

        var onCloseButtonClicked = 'onAfterCloseButtonClicked' + $scope.location;
        $scope.$on(onCloseButtonClicked, function (event, widget) {
             $scope.uninstall(widget.location, widget.application, widget.widget, widget.courseId);
        });
    });

    $scope.isInstalled = function(widgetId){
        if($scope.installedWidgets){
            var isInstalled = _.find($scope.installedWidgets, {widgetId:{_id: widgetId}});
            return isInstalled;
        }

        return false;
    };

    $scope.install = function(location, application, name, courseId){
        var params = {
            application: application,
            widget: name,
            location: location
        };

        if(courseId)
            params.courseId = courseId;

        $http.put('/api/widgets/install', params).success(function (data) {
            if(data.result)
                $scope.installedWidget = data.installed;

            // hide the widget gallery
            $('#widgetGallery').modal('hide');

            $rootScope.$broadcast('onAfterInstall' + location, $scope.installedWidget);
        });
    };

    $scope.uninstall = function(location, application, name, courseId){
        var params = {
            application: application,
            widget: name,
            location: location
        };

        if(courseId)
            params.courseId = courseId;

        $http.put('/api/widgets/uninstall', params).success(function (data) {
            if(data.result)
                $scope.uninstalledWidget = data.uninstalled;

            // hide the widget gallery
            $('#widgetGallery').modal('hide');

            $rootScope.$broadcast('onAfterUninstall' + location, $scope.uninstalledWidget);
        });
    };

});
