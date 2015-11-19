app.controller('DiscussionController', function ($scope, $rootScope, $http, $location, $sce,
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
    $scope.replies = [];

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

                    var i = _.findIndex($scope.topics, {'discussion': {'_id': data.post._id}});
                    $scope.topics[i].discussion = data.post;
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
        var i = _.findIndex($scope.topics, {'discussion': {'_id': postId}});
        if ($scope.topics[i]) {
            $scope.currentTopic = cloneSimpleObject($scope.topics[i].discussion);

            Page.setTitle($scope.pageTitleOnDiscussion + ' > ' + $scope.currentTopic.title);

            $scope.currentTopic.createdBy = $scope.topics[i].createdBy;

            $scope.originalCurrentTopic = cloneSimpleObject($scope.topics[i].discussion);

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
                $scope.pageTitleOnDiscussion = Page.title();
                $scope.initiateTopic();
            },

            function (errors) {
                toastr.error(errors);
            }
        );
    };

    $scope.tabOpened = function () {
        $scope.actionBarTemplate = 'actionBar-course-discussion';

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
        var i = _.findIndex($scope.topics, {discussion: {'_id': postId}});
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
});