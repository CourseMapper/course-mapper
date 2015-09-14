angular.module('SlideViewerAnnotationZones', [])
.directive('saAnnotationzone',
    function() {
        return {
            restrict: 'A',
            scope: {
                name: '=',
            },
            replace:true,
            templateUrl: '/slide-viewer/js/directives/sa-annotationzone.html',
            //controller: 'sa-annotationzone-controller'
        };
    }
);
