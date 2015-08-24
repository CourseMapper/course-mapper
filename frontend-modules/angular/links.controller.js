app.
    controller('LinksController', function($scope, $rootScope, $http, $location, $sce, $compile, ActionBarService, $timeout) {
        $scope.formData = {};
        $scope.course = {};
        $scope.contentNode = {};
        $scope.currentLink = false;
        $scope.originalCurrentLink = {};
        $scope.pid = false;
        $scope.currentLinkUrl = "";
        $scope.links = [];

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

        $scope.saveNewPost = function(){
            console.log('saving bookmark');

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

                        $('#addNewLinksModal').modal('hide');
                    } else {
                        if( data.result != null && !data.result){
                            $scope.errorName = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        };

        $scope.saveEditPost = function(){
            console.log('saving edit bookmark');

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

                        $('#editLinksModal').modal('hide');

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

        $scope.deletePost = function(postId){
            var r = confirm("Are you sure you want to delete this link?");

            if (r == true) {
                $http({
                    method: 'DELETE',
                    url: '/api/links/' + $scope.course._id +'/link/' + postId,
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
            var i = _.findIndex($scope.topics, { discussion: { '_id' : postId}});
            $scope.links[i].isDeleted = true;

            $scope.currentLink = false;
            $scope.pid = false;
            $location.search('pid', '');
            $scope.initiateLink();

            $timeout(function(){
                $scope.$apply();
            });
        });

        $scope.manageActionBar = function(){
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
                        ' data-toggle="modal" data-target="#editLinksModal"' +
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
                $scope.originalCurrentTopic = cloneSimpleObject($scope.links[i].link);
                $scope.currentLinkUrl = $sce.trustAsResourceUrl($scope.currentLink.content);
            }
        };

        $scope.cancel = function(){
            $scope.currentLink = $scope.originalCurrentLink;
        };

        $scope.getSrc = function(url) {
            return $sce.trustAsResourceUrl(url);
        };

    });