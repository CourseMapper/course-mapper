/*jslint node: true */
'use strict';

app.directive('timepicker', function () {
    function msToTime(s) {
        function addZ(n) {
            return (n < 10 ? '0' : '') + n;
        }

        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;
        return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs);
    }

    return {
        restrict: 'EA',
        scope: {
            time: '=?'
        },
        template: '<div class="input-group bootstrap-timepicker timepicker">' +
        '<input id="timepicker2" type="text" class="form-control input-small">' +
        '<span class="input-group-addon">' +
        '<i class="glyphicon glyphicon-time"></i></span> </div>',
        link: function (scope, element, attrs) {
            var tp = element.find('input');
            tp.timepicker({
                minuteStep: 1,
                template: 'modal',
                secondStep: 1,
                appendWidgetTo: 'body',
                showSeconds: true,
                showMeridian: false,
                defaultTime: false
            });

            scope.time = scope.time || {};
            if (attrs.time)
                scope.time = attrs.time;

            attrs.$observe('time', function (value) {
                var time = msToTime(value);
                console.log('### TIME: ' + time);
                tp.timepicker('setTime', time);
            });

            // remove event handlers
            scope.$on('$destroy', function () {
                element.off('**');
            });
        }
    };
});
