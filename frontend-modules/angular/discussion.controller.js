app.controller('DiscussionController', function($scope, $rootScope, $http, $location, $sce, $compile, ActionBarService, $timeout) {
    $scope.formData = {};
    $scope.course = {};
    $scope.currentReplyingTo = false;
    $scope.currentEditPost = {};
    $scope.currentTopic = false;
    $scope.originalCurrentTopic = {};

    $scope.pid = false;

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

    $scope.saveNewPost = function(){
        console.log('saving');

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
                } else {
                    if( data.result != null && !data.result){
                        $scope.errorName = data.errors;
                        console.log(data.errors);
                    }
                }
            }) ;
    };

    $scope.saveEditPost = function(){
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
                } else {
                    if( data.result != null && !data.result){
                        $scope.errorName = data.errors;
                        console.log(data.errors);
                    }
                }
            }) ;
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
    };

});