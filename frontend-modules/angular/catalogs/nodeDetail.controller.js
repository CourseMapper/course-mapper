app.controller('NodeDetailController', function($scope, $rootScope, $filter, $http, $location,
                                                $routeParams, $timeout, ActionBarService,
                                                Page
) {
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
    $scope.defaultPath = "video";
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
                    if(res.result){
                        $location.path('/cid/' + $scope.courseId);
                        $location.search('tab', 'map');
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
        var q = $location.search();

        if(!q.tab) {

            jQuery('#video').removeClass('active');
            jQuery('li.video').removeClass('active');

            jQuery('#pdf').removeClass('active');
            jQuery('li.pdf').removeClass('active');

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

        if($scope.isVideoExist && $scope.isPdfExist){
            $scope.defaultPath = 'video';
        } else if($scope.isPdfExist){
            $scope.defaultPath = 'pdf';
        }

        $scope.currentTab = $scope.defaultPath;
        $scope.actionBarTemplate = 'actionBar-node-' + $scope.currentTab;

        $rootScope.$broadcast('onNodeTabChange', $scope.currentTab);

        $scope.manageActionBar();
    };

    /*$scope.$on('onNodeTabChange', function(event, tab){
        console.log(tab);
    });*/

    $scope.currentNodeAction = {};
    $scope.setEditMode = function(){
        $scope.currentNodeAction.mode = "edit";
        $scope.currentNodeAction.type = "contentNode";
        $scope.currentNodeAction.typeText = "Content Node";
        $scope.currentNodeAction.parent = $scope.treeNode;

        $scope.nodeModaltitle = "Edit " + $scope.currentNodeAction.typeText;

        $rootScope.$broadcast('onAfterSetMode', $scope.course, $scope.treeNode);
    };

    $scope.parseResources = function(){
        for(var i = 0;i < $scope.treeNode.resources.length; i++){
            var content = $scope.treeNode.resources[i];
            if(content['type'] == 'mp4'
                || content['type'] == 'video'
                || content['type'] == 'videoLink'
            ){
                $scope.isVideoExist = true;
                $scope.videoFile = content;
                $scope.treeNode.videoFile = content;
            } else if(content['type'] == 'pdf'
                || content['type'] == 'pdfLink'
            ){
                $scope.pdfFile = content;
                $scope.treeNode.pdfFile = content;
                $scope.isPdfExist = true;
            }
        }
    };

    $scope.initNode = function(){
        $http.get('/api/treeNode/' + $scope.nodeId).success(function(res){
            if(res.result) {
                $scope.treeNode = res.treeNode;

                if($scope.course && $scope.treeNode)
                    Page.setTitleWithPrefix($scope.course.name + ' > Map > ' + $scope.treeNode.name);

                $scope.parseResources();

                if ($scope.treeNode.createdBy == $rootScope.user._id) {
                    $scope.isNodeOwner = true;
                    $scope.setEditMode();
                }

                $scope.changeTab();

                $timeout(function(){
                    $scope.$broadcast('onAfterInitTreeNode', $scope.treeNode);
                });
            }
        });
    };

    $scope.$on('onAfterEditContentNode', function(event, oldTreeNode){
        $scope.initNode();
    });

    /**
     * ping server on our latest page read
     */
    $scope.$on('onPdfPageChange', function(event, params){
        $http.get('/slide-viewer/read/' + $scope.courseId + '/' + $scope.nodeId + '/' + $scope.pdfFile._id + '/' + params[0] + '/' + params[1]);
    });

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

        //$scope.changeTab();
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

            if ($scope.course.createdBy._id == $rootScope.user._id) {
                $scope.isOwner = true;
                $scope.enrolled = true;
            }
        }
    });

    $scope.$on('$routeUpdate', function(){
        var q = $location.search();

        if(q.tab) {
            if($scope.currentTab && $scope.currentTab != q.tab){
                $scope.changeTab();
            }
        }
        else
            $scope.changeTab();
    });
});
