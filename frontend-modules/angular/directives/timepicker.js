'use strict';

videoAnnotationsModule.directive('cmTimepicker', function ($timeout) {
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

  function timeToMs(time) {
    var a = time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return seconds * 1000;
  }

  return {
    restrict: 'EA',
    template: '<div class="input-group bootstrap-timepicker timepicker">' +
    '<input id="timepicker2" type="text" class="form-control input-small"></div>',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      var tp = element.find('input');
      var value = parseInt(scope.$eval(attrs.ngModel));

      tp.timepicker({
        minuteStep: 1,
        template: 'modal',
        secondStep: 1,
        appendWidgetTo: 'body',
        showSeconds: true,
        showMeridian: false,
        defaultTime: false
      });

      tp.timepicker('setTime', msToTime(value));

      tp.on('changeTime.timepicker', function (e) {
        var time = timeToMs(e.time.value);
        ngModel.$setViewValue(time);
        ngModel.$render();
        $timeout(function () {
          scope.$apply();
        });
      });

      scope.$on('$destroy', function () {
        element.off('**');
      });
    }
  };
});