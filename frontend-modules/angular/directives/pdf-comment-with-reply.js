app.directive('pdfComment',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                postedBy: '@',
                postedDate: '@',
                showControl: '=',
                showReplyButton: '=',
                showEditButton: '=',
                showDeleteButton: '=',
                authorClickAction: '&',
                authorClickable: '=',
                postContent: '=',
                isPostOwner: '=',
                isDeleted: '=',
                postId: '@',
                editAction: '&',
                deleteAction: '&',
                replyAction: '&',
                showCommentingArea: '=',
                comments: '=',
                postComment: '&',
                commentText: '=',
                removeFunction: '&'
            },

            templateUrl: '/angular/views/pdf-comment.html',

            controller: function($http, $scope, $rootScope, $sce){
                //$scope.commentText = "";

                //console.log($scope.postComment);


                $scope.removeComment = function(commentId){
                    //var id = commentId;
                    $scope.removeFunction({id:commentId});
                    //alert(commentId);
                }

                //console.log($scope.removeComment);
            }
        };
    });
