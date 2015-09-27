app.directive('comment',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                postedBy: '@',
                postedDate: '@',
                showControl: '=',
                authorClickAction: '&',
                authorClickable: '=',
                postContent: '=',
                isPostOwner: '=',
                isDeleted: '=',
                postId: '@',
                editAction: '&',
                deleteAction: '&'
            },

            templateUrl: '/angular/views/discussion.reply.html'/*,

            link: function (scope, element, attrs) {
                $timeout(function () {
                    scope.$apply();
                });

                $compile(element.contents())(scope.$new());
            }*/
        };
    });