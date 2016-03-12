'use strict';

videoAnnotationsModule.directive('videoAnnotation', function () {
  return {
    scope: {
      source: '='
    },
    templateUrl: '/src/video-annotations/va-annotation/va-annotation.html',
    controller: 'VaController'
  };
});
