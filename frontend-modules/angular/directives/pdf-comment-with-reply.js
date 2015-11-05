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
                //showEditButton: '=',
                //showDeleteButton: '=',
                authorClickAction: '&',
                authorClickable: '=',
                postContent: '=',
                isPostOwner: '=',
                postOwner: '=',
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


                var user = $rootScope.user;
                var isAuthor = $scope.postOwner === user.username;
                var isAdmin = user.role === 'admin';
                var hasPermission = (isAuthor || isAdmin);

                $scope.isAdmin = isAdmin;

                $scope.showEditButton = hasPermission;
                $scope.showDeleteButton = hasPermission;


                //console.log($scope.removeComment);
            }
        };
    });
