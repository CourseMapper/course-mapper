'use strict';

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