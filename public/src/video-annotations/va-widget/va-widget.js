/*jslint node: true */
'use strict';

videoAnnotationsModule.directive('vaWidget',
  function () {
    return {
      restruct: 'A',
      scope: {
        videoSource: '@',
        videoId: '@'
      },
      templateUrl: '/src/video-annotations/va-widget/va-widget.html',
      controller: 'VaWidgetController'
    };
  }
);
