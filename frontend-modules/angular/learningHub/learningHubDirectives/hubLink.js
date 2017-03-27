// select the template to use based on the type of post
learningHubModule.directive('hubLink', function () {
        var setTemplate = function (post) {
            var postType = post.type;
            var templateUrl = '/learningHubTemplates/hublinknothumb.html';
            switch (postType) {
                case 'video':
                    templateUrl = '/learningHubTemplates/hubvideo.html';
                    break;
                case 'pdf':
                    templateUrl = '/learningHubTemplates/hubpdf.html';
                    break;
                case 'audio':
                    templateUrl = '/learningHubTemplates/hubaudio.html';
                    break;
                case 'slide':
                    templateUrl = '/learningHubTemplates/hubslide.html';
                    break;
                case 'image':
                    templateUrl = '/learningHubTemplates/hubimage.html';
                    break;
                case 'doc':
                    templateUrl = '/learningHubTemplates/hubdoc.html';
                    break;
                case 'link':{
                    if(post.image){
                        templateUrl = '/learningHubTemplates/hublinkthumb.html';
                    }else{
                        templateUrl = '/learningHubTemplates/hublinknothumb.html';
                    }
                    break;
                }
            }
            return templateUrl;
        };
        return {
            restrict: 'E',
            bindToController: true,
            controller: "HubLinkController as vm",
            scope: {
                post: '=',
                space: "="
            },
            link: function (scope) {
               scope.templateUrl = setTemplate(scope.vm.post);
            },
            template: "<div ng-include='templateUrl'></div>"
        };
    })
    .controller( 'HubLinkController', [ '$rootScope', '$scope', '$sce','$http','socket','toastr', '$uibModal', 'treeNodeService', 'authService',function ($rootScope,$scope, $sce, $http, socket, toastr, $uibModal, treeNodeService, authService) {
        // view data preparation
        var vm = this;
        // set whether the post is added to the persnal space of the user
        vm.pa = false;
        // local copy of the contents of the post
        var dupVm = angular.copy($scope.vm.post);
        // comment related initialisation
        vm.toggle = false;
        vm.commentText = '';
        vm.commentSliderId = "c" + vm.post.postId;
        // check owner and space to show the edit delete
        if(vm.space){
            vm.owner = false;
            vm.pa = true;
        }else{
            var user = authService.user;
            var isAdmin = user.role === 'admin';
            vm.owner = (vm.post.userId == authService.user._id) || isAdmin;
            vm.pa = false;
            for(var i = 0; i < vm.post.personalUsers.length; i++) {
                if (vm.post.personalUsers[i].userId == authService.user._id) {
                    vm.pa = true;
                    break;
                }
            }
        }

        // post edit methods
        var editInstance;
        vm.edit = function(){
            editInstance = $uibModal.open({
                templateUrl: '/learningHubTemplates/hubPostEdit.html',
                scope: $scope, //passed current scope to the modal
                size: 'lg',
                backdrop: false
            });
        };

        vm.confirmEdit = function(post){
            post.tags = vm.validTags(post.tags);
            $http.post('/api/learningHub/edit/' + treeNodeService.treeNode._id,
                post)
                .success( function(data){
                    //update the copy if it is edited in the edit dialog
                    dupVm = angular.copy($scope.vm.post);
                    $('#editPost').modal('hide');
                    toastr.success("Successfully Edited", vm.post.title);
                    // emit the edit success event
                    $scope.$emit('LinkEditDelete', {
                        linkAction : "linkEdit"
                    });
                })
                .error( function(data){
                    $('#EditPost').modal('hide');
                    toastr.error("Error in Editing", vm.post.title);
                    window.location.reload();
                });

        };

        vm.cancelEdit = function(){
            $scope.vm.post = dupVm;
            editInstance.close();
        };

        //post delete methods
        var deleteInstance;
        vm.delete = function(post){
            deleteInstance = $uibModal.open({
                templateUrl: '/learningHubTemplates/hubPostDelete.html',
                scope: $scope, //passed current scope to the modal
                size: 'lg',
                backdrop: false
            });
        };

        vm.confirmDelete = function(postId){
            $http.delete('/api/learningHub/delete/'+treeNodeService.treeNode._id,
                {
                    params:{
                        'postId' : postId
                    }
                })
                .success( function(data){
                    toastr.success("Successfully Deleted", vm.post.title);
                    $scope.$emit('LinkEditDelete', {
                        linkAction : "linkDelete"
                    });
                })
                .error( function(data){
                    toastr.error("Error in deleting", vm.post.title);
                    window.location.reload();
                });
        };

        vm.deleteClose = function(){
            deleteInstance.close();
            $('#postDelete').modal('hide');
        };
        // validate and formatt the tags
        vm.validTags=function(unformattedTags){
            var formattedTags = [];
            Object.keys(unformattedTags).forEach(function(tag){
                formattedTags.push(unformattedTags[tag].text)
            });
            return formattedTags;
        };
        // add or remove post to personal space
        vm.togglePersonal = function(post) {
            vm.pa = !vm.pa;
            if(vm.pa){
                $http.post('/api/learningHub/addPersonal/' + treeNodeService.treeNode._id,
                    dupVm)
                    .success( function(data){
                        toastr.success("Successfully added to personal space", vm.post.title);
                    })
                    .error( function(data){
                        toastr.error("Error in adding to personal space", vm.post.title);
                        window.location.reload();
                    });
            }

            if(!vm.pa){
                $http.delete('/api/learningHub/deletePersonal/'+treeNodeService.treeNode._id,
                    {
                        params:{
                            'postId' : vm.post.postId
                        }
                    })
                    .success( function(data){
                        toastr.success("Successfully deleted from personal space ", vm.post.title);
                        console.log("delete before emit");
                        $scope.$emit('LinkEditDelete', {
                            linkAction : "linkDelete"
                        });
                    })
                    .error( function(data){

                        toastr.error("Error in deleting from personal space", vm.post.title);
                        window.location.reload();

                    });
            }
        };
        // comments related methods
        markAuthoredComments(vm.post.comments);
        function markAuthoredComments(comments) {
            var user = authService.user;
            var isAdmin = user.role === 'admin';

            _.forEach(comments, function (comment) {
                if (isAdmin) {
                    comment.canEdit = true;
                } else {
                    var isAuthor = comment.author === user.username;
                    comment.canEdit = isAuthor;
                }
            });
        }
        // add comment emit event
        vm.postComment = function(post){
            var postId = vm.post._id;
            var commentText = vm.commentText;
            if (!commentText || !postId) {
                return;
            }

            var params = {
                postId: postId,
                text: commentText
            };

            socket.emit('comments:post', params);
            vm.commentText = '';
            vm.commentDisplayText(vm.post.comments.length);
        };
        // remove comment emit event
        vm.removeComment = function (commentId) {
            var params = {
                postId: vm.post._id,
                commentId: commentId
            };
            socket.emit('comments:remove', params);
            vm.commentText = '';
        };
        // recieve the comment list updated event
        socket.on(vm.post._id + ':comments:updated', function (params) {
            markAuthoredComments(params.comments);
            vm.post.comments = params.comments;
        });

        vm.commentDisplayText = function(commentLength) {
            if(commentLength == 0){
                return "No Comments"
            }else{
                return commentLength + (commentLength > 1 ? " Comments" : " Comment");
            }
        };

        if(!vm.space){
            vm.commentHeadingText = vm.commentDisplayText(vm.post.comments.length);
        }
    }] );

