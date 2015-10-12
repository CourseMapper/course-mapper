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
                comments: '='
            },

            templateUrl: '/angular/views/pdf-comment.html'
        };
    });