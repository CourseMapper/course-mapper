app.
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
    $scope.orderType = 'dateAdded.-1';
    $scope.orderBy = -1;
    $scope.sortBy = 'dateAdded';
    $scope.currentPage = 1;
    $scope.pageReset = false;

    $scope.orderingOptions = [
        {id: 'dateAdded.-1', name: 'Newest First'},
        {id: 'dateAdded.1', name: 'Oldest First'},
        {id: 'totalVotes.-1', name: 'Most Popular'}
    ];

    $scope.initiateLink = function (pid) {
        $scope.pid = pid;
        $location.search('pid', pid);

        if ($scope.pid) {
            $scope.setCurrentLink($scope.pid)
        }

        $scope.manageActionBar();
    };

    $scope.newRowsFetched = function (newRows, allRows) {
        if (newRows) {
            $scope.links = allRows;
        }
    };

    $scope.linksLength = function () {
        return $scope.links.length;
    };

    $scope.paginationReset = function () {
        return $scope.pageReset;
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
                    data.post.createdBy = authService.user;
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

            if ($scope.isAdmin || $scope.isOwner || $scope.isManager ||
                $scope.currentLink.createdBy._id == authService.user._id ||
                $scope.currentLink.createdBy == authService.user._id
            ) {
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

    $scope.$watch('orderType', function (newVal, oldVal) {
        if (newVal != oldVal) {
            var spl = newVal.id.split('.');

            linkService.setPageParams({
                sortBy: spl[0],
                orderBy: parseInt(spl[1]),
                limit: 10,
                lastPage: false
            });

            $scope.sortBy = spl[0];
            $scope.orderBy = parseInt(spl[1]);
            // reset the page
            $scope.currentPage = 0;
            $scope.pageReset = Math.random();

            linkService.init(treeNodeService.treeNode._id,

                function (posts) {
                    $scope.links = posts;
                    $scope.pageTitleOnLink = Page.title();
                    $scope.initiateLink();
                },

                function (errors) {
                    toastr.error(errors);
                }, true
            );
        }
    });

    $scope.tabOpened();
});
