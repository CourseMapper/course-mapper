app.directive('comment',
    function ($compile) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                postedBy: '@',
                postedDate: '@',
                postContent: '=',
                isPostOwner: '=',
                isDeleted: '=',
                postId:'@',
                editAction: '&',
                deleteAction: '&'
            },

            templateUrl: '/angular/views/discussion.reply.html'/*,

            controller: function ($scope, $compile, $http, $attrs) {

            },

            link: function(scope, element, attrs) {
                $compile(element.contents())(scope.$new());
            }*/
        };
    });