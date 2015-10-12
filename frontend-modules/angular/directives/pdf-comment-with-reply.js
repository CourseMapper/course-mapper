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
                postComment: '&'
            },

            templateUrl: '/angular/views/pdf-comment.html',

            controller: function($http, $scope, $rootScope, $sce){
                $scope.commentText = "";

                $scope.postComment = function(){
                    alert($scope.commentText);
                };

                $scope.removeComment = function(commentId){
                    alert(commentId);
                }
            }
        };
    });