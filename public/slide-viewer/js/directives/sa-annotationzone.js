angular.module('SlideViewerAnnotationZones', [])
.directive('saAnnotationzone',
    function() {
        return {
            restrict: 'A',
            scope: {
                videoSource: '=',
                videoId: '='
            },
            templateUrl: '/slide-viewer/js/directives/sa-annotationzone.html',
            //controller: 'sa-annotationzone-controller'
        };
    }
);
