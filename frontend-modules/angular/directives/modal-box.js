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

            templateUrl: '/partials/modal-box.html',

            link: function (scope, el, attrs) {
            }
        };
    });
