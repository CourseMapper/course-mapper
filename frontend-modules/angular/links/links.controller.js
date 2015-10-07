app.
    controller('LinksController', function($scope, $rootScope, $http, $location,
                                           $sce, $compile, ActionBarService, $timeout,
                                           toastr
    ) {
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

                    if(data.result) {
                        $scope.$emit('onAfterCreateNewLink', data.post);
                        $scope.links.unshift(data.post);
                        $timeout(function(){$scope.$apply()});

                        $scope.formData = {};
                        $scope.AddLinkForm.$setPristine();

                        $('#AddLinksModal').modal('hide');
                    }

                    toastr.error('Successfully Saved');
                    $scope.isLoading = false;
                })
                .error(function(data){
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                    toastr.error('Saving Failed');
                });
        };

        $scope.saveEditPost = function(isValid){
            if(!isValid)
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
                .success(function(data) {
                    if(data.result) {
                        $scope.$emit('onAfterEditLinks', data.post);

                        $('#EditLinksModal').modal('hide');

                        var i = _.findIndex($scope.links, { 'link': {'_id' : data.post._id}});
                        $scope.links[i].link = data.post;
                        $timeout(function(){$scope.$apply()});

                        toastr.error('Successfully Saved');
                    }

                    $scope.AddLinkForm.$setPristine();
                    $scope.isLoading = false;
                })
                .error(function(data){
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                    toastr.error('Saving Failed');
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
                        if(data.result) {
                            $scope.$emit('onAfterDeleteLink', postId);

                        }
                    })
                    .error(function(data){
                        $scope.errors = data.errors;
                        toastr.error('Delete Failed');
                    });
            }
        };

        $scope.$on('$routeUpdate', function(){
            $scope.initiateLink();
        });

        $scope.$on('onAfterDeleteLink', function(e, postId){
            var i = _.findIndex($scope.links, { link: { '_id' : postId}});
            if(i >= 0) {
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

    });