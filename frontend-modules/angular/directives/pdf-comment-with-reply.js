app.directive('pdfComment', function ($compile, $timeout) {
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
      recentSubmitOnAnnotation: '=',
      commentText: '=',
      removeFunction: '&',
      isPrivate: '='
    },
    templateUrl: '/partials/pdf-comment.html',
    controller: function ($http, $scope, $rootScope, $sce) {
      $scope.removeComment = function (commentId) {
        $scope.removeFunction({id: commentId});
      };

      var user = $rootScope.user;
      var isAuthor = $scope.postOwner === user.username;
      var isAdmin = user.role === 'admin';
      var hasPermission = (isAuthor || isAdmin);

      $scope.isAdmin = isAdmin;
      $scope.showEditButton = hasPermission;
      $scope.showDeleteButton = hasPermission;
      $scope.toggle = $scope.recentSubmitOnAnnotation;
      $scope.postedDate = new Date($scope.postedDate);
    }
  };
});