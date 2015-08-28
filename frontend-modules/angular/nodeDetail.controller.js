app.controller('NodeDetailController', function($scope, $rootScope, $filter, $http, $location, $routeParams, $timeout, ActionBarService) {
    $scope.course = null;
    $scope.user = null;
    $scope.treeNode = null;
    $scope.enrolled = false;
    $scope.loc = $location.absUrl() ;
    $scope.courseId = $routeParams.courseId;
    $scope.nodeId = $routeParams.nodeId;
    $scope.isOwner = false;
    $scope.isNodeOwner = false;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $scope.currentTab = "preview";
    $scope.tabs = {
        'preview':'Preview',
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
        if($scope.currentTab == 'preview' && $scope.treeNode) {
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
        var defaultPath = "preview";
        var q = $location.search();

        if(q.tab){
            defaultPath = q.tab;
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

        $scope.nodeModaltitle = "Edit " + $scope.currentNodeAction.typeText;
        //$scope.nodeModaltitle += " " + $scope.treeNode.name;

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

                $scope.manageActionBar();

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
});