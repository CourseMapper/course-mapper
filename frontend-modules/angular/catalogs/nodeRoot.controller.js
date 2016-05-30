app.controller('NodeRootController', function ($scope, $rootScope, $filter, $http, $location,
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

    $scope.showEnrollForm = function () {
        $('#enrollForm').modal('show');
    };

    $scope.isAuthorized = function () {
        return ($scope.isAdmin || $scope.isOwner || $scope.isManager || $scope.isNodeOwner);
    };

    $scope.initNode = function () {
        courseService.init(
            $scope.courseId,

            function (course) {
                $scope.course = course;
                $scope.setCapabilities();

                $timeout(function () {
                    if (!authService.isLoggedIn && $scope.course) {
                        var q = $location.search();
                        if (q.tab)
                            $scope.currentTab = q.tab;

                        authService.showLoginForm();
                    }
                    else if ($scope.course && !$scope.isAuthorized() && !$scope.isEnrolled) {
                        $scope.showEnrollForm();
                    } else {
                        treeNodeService.init($scope.nodeId,
                            function (treeNode) {
                                $scope.treeNode = treeNode;
                                $scope.videoFile = treeNodeService.videoFile;
                                $scope.pdfFile = treeNodeService.pdfFile;

                                Page.setTitleWithPrefix($scope.course.name + ' > Map > ' + $scope.treeNode.name);

                                if ($scope.treeNode.createdBy == $rootScope.user._id)
                                    $scope.isNodeOwner = true;

                                if ($scope.isAuthorized()) {
                                    $scope.setEditMode();
                                }

                                $scope.changeTab();

                                $timeout(function () {
                                    $scope.$broadcast('onAfterInitTreeNode', $scope.treeNode);
                                });
                            },
                            function (err) {
                                $scope.nodeError = true;
                                $scope.error = err;
                            }
                        );
                    }
                }, 120);
            },

            function (res) {
                $scope.errors = res.errors;
                //toastr.error('Failed getting course');
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

        if (authService.user)
            $scope.isOwner = authService.user._id == $scope.course.createdBy._id;
        else
            $scope.isOwner = false;

        $scope.isAdmin = authService.isAdmin();
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
