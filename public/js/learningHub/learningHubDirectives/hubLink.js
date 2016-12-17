
learningHubModule.directive('hubLink', function () {
        var setTemplate = function (post) {
            var postType = post.type;
            console.log(post);
            var templateUrl = 'js/learningHub/learningHubDirectives/hubvideo.html';
            switch (postType) {
                case 'video':
                    templateUrl = 'js/learningHub/learningHubDirectives/hubvideo.html';
                    break;
                case 'pdf':
                    templateUrl = 'js/learningHub/learningHubDirectives/hubpdf.html';
                    break;
                case 'slide':
                    templateUrl = 'js/learningHub/learningHubDirectives/hubslide.html';
                    break;
                case 'image':
                    templateUrl = 'js/learningHub/learningHubDirectives/hubimage.html';
                    break;
                case 'link':{
                    if(post.image){
                        templateUrl = 'js/learningHub/learningHubDirectives/hublinkthumb.html';
                    }else{
                        templateUrl = 'js/learningHub/learningHubDirectives/hublinknothumb.html';
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
                post: '='
            },
            link: function (scope) {
               scope.templateUrl = setTemplate(scope.vm.post);
            },
            template: "<div ng-include='templateUrl'></div>"
        };
    })
    .controller( 'HubLinkController', [ '$rootScope', '$scope', '$sce','$http', 'toastr', '$uibModal', function ($rootScope,$scope, $sce, $http, toastr, $uibModal) {

        // view data preparation
        var vm = this;
        vm.post.url = $sce.trustAsResourceUrl(vm.post.url);
        vm.owner = (vm.post.userId == 1);
        if(vm.post.embedHtml){
            vm.post.embedHtml = $sce.trustAsHtml(vm.post.embedHtml);
        }

        //edit methods
        var editInstance;
        var dupVm ;
        vm.edit = function(){
            dupVm = angular.copy($scope.vm.post);
            editInstance = $uibModal.open({
                templateUrl: 'js/learningHub/learningHubDirectives/hubPostEdit.html',
                scope: $scope, //passed current scope to the modal
                size: 'lg'
            });
        };

        vm.confirmEdit = function(post){
            post.tags = vm.validTags(post.tags);
            console.log(post.tags);
            $http.post('/api/edit',
                post)
                .success( function(data){
                    console.log('edited');
                    $('#editPost').modal('hide');
                    toastr.success("Successfully Edited", vm.post.title);
                    //window.location.reload();
                    $scope.$emit('LinkEditDelete', {
                        linkAction : "linkEdit"
                    });
                })
                .error( function(data){
                    console.log('error');
                    $('#EditPost').modal('hide');
                    toastr.error("Error in Editing", vm.post.title);
                    window.location.reload();
                });

        };

        vm.validTags=function(unformattedTags){
            var formattedTags = [];
            Object.keys(unformattedTags).forEach(function(tag){
                formattedTags.push(unformattedTags[tag].text)
            });
            return formattedTags;
        };

        //delete methods
        var deleteInstance;
        vm.delete = function(post){
            deleteInstance = $uibModal.open({
                templateUrl: 'js/learningHub/learningHubDirectives/hubPostDelete.html',
                scope: $scope, //passed current scope to the modal
                size: 'lg'
            });
        };

        vm.confirmDelete = function(postId){
            console.log(vm.post.postId);
            $http.delete('/api/delete',
                {
                    params:{
                        'postId' : postId
                    }
                })
                .success( function(data){
                    console.log('deleted');
                    toaster.success("Successfully Deleted", vm.post.title);
                    //window.location.reload();
                    $scope.$emit('LinkEditDelete', {
                        linkAction : "linkDelete"
                    });
                })
                .error( function(data){
                    //console.log('error');
                    //$('#deletePost').modal('hide');
                    toastr.error("Error in deleting", vm.post.title);
                    window.location.reload();
                });
        };

        vm.deleteClose = function(){
            deleteInstance.close();
            $('#postDelete').modal('hide');
        }
        vm.cancelEdit = function(){
            console.log('called');
            $scope.vm.post = dupVm;
            editInstance.close();
        }

    }] );

