app.
    controller('DiscussionController', function($scope, $rootScope, $http, $location, $sce) {
        $scope.formData = {};
        $scope.course = {};
        $scope.currentReplyingTo = false;
        $scope.currentEditPost = {};
        $scope.currentTopic = {};

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
            $scope.manageActionBar($scope.pid);

            if($scope.pid) {
                $scope.getReplies($scope.pid);
            }
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

        $scope.$on('$routeUpdate', function(){
            $scope.initiateTopic();
        });

        $scope.$on('onAfterEditReply', function(e, f){
            var i = _.findIndex($scope.replies, { '_id' : f.postId});
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

        $scope.manageActionBar = function(){
            var menuContainer = $('.actionBar-discussion-buttons');
            if($scope.pid){
                var newMenu = '<li>' +
                    '<a style="cursor: pointer;"' +
                        'data-toggle="modal" data-target="#addNewReplyModal"' +
                        'title="Reply">' +
                        '&nbsp;&nbsp; <i class="ionicons ion-reply"></i> &nbsp; REPLY</a>' +
                    '</li>';

                if($scope.currentTopic.createdBy==$rootScope.user._id) {
                    newMenu += '<li>' +
                                '<a style="cursor: pointer;"' +
                                'click="deletePost(' + $scope.currentTopic._id + ')"' +
                                'title = "delete" > ' +
                                '&nbsp;&nbsp; <i class="ionicons ion-close"></i> &nbsp;DELETE THIS TOPIC</a>' +
                                '</li>';
                }

                menuContainer.html(newMenu);
            }
            else if(!$scope.pid){
                menuContainer.html('');
            }
        };

        $scope.getReplies = function(postId){
            var i = _.findIndex($scope.topics, { 'discussion': {'_id' : postId}});
            $scope.currentTopic = $scope.topics[i].discussion;
            $scope.currentReplyingTo = $scope.currentTopic._id;

            $http.get('/api/discussion/' + postId + '/posts').success(function(res){
                if(res.result){
                    $scope.replies = res.posts;

                    //$sce.trustAsHtml(res.widgets);

                }
            });
        }

    });