/*jslint node: true */
'use strict';

videoAnnotationsModule.directive('videoAnnotation', function() {
    return {
        scope: {
            source: '='
        },
        templateUrl: '/src/video-annotations/scripts/directives/va-annotation/va-annotation.html',
        controller: 'VaController'
    };
});
