/*jslint node: true */
'use strict';

app.directive('timepicker', function () {
    return {
        restrict: 'EA',
        scope: {
            time: '='
        },
        template: '<input type="text" class="form-control input-small">',
        link: function (scope, element, attrs) {
            element.timepicker({
                minuteStep: 1,
                template: 'modal',
                appendWidgetTo: 'body',
                showSeconds: true,
                showMeridian: false,
                defaultTime: false
            });

            attrs.$observe('time', function (value) {
                console.log('#########' + value);
                element.timepicker('setTime', new Date(value));
            });

            // remove event handlers
            scope.$on('$destroy', function () {
                element.off('**');
            });
        }
    };
});
