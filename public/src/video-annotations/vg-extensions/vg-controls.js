'use strict';

videoAnnotationsModule.directive("vgResumeButton", function ($http) {
    return {
      restrict: "E",
      require: "^videogular",
      template: "<button class='iconButton' type='button' ng-click='onClickedResume()'>R</button>",
      link: function (scope, elem, attrs, API) {

        scope.$watch('API.pulseUrl', function (newVal, oldVal) {
          if (!newVal) {
            return;
          }
          $http.get(newVal)
            .success(function (data) {
              var position = (data.pointer / 1000);
              console.log('Last watched position: ' + position + ' sec.');
              if (position >>> 0) {
                scope.onClickedResume = function () {
                  API.seekTime(position);
                }
              }
            });
        });
      }
    }
  }
);

videoAnnotationsModule.directive("vgFootprint", function () {
    return {
      restrict: "E",
      require: "^videogular",
      template: "<div class='fp-timeline' ng-style='timelineWidth'></div>"
    }
  }
);

videoAnnotationsModule.directive("vgFootprintInfo", function () {
    return {
      restrict: "E",
      require: "^videogular",
      template: "<div class='fp-info-data'></div>"
    }
  }
);