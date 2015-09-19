app.directive('comment',
    function ($compile) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                postedBy: '@',
                postedDate: '@',
                showControl: '=',
                postContent: '=',
                isPostOwner: '=',
                isDeleted: '=',
                postId:'@',
                editAction: '&',
                deleteAction: '&'
            },

            templateUrl: '/angular/views/discussion.reply.html'
        };
    });