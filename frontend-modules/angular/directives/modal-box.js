app.directive('modalBox',
    function ($compile, $timeout, $rootScope) {
        return {
            restrict: 'E',

            terminal: true,
            transclude: true,

            scope: {
                mid: '@',
                title: '@'
            },

            templateUrl: '/angular/views/modal-box.html',

            link: function (scope, el, attrs) {
            }
        };
    });
