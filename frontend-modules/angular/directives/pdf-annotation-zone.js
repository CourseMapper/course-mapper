app.directive('pdfAnnotationZone',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {

            },

            templateUrl: '/angular/views/pdf-annotation-zone.html',

            controller: function($http, $scope, $rootScope, $sce){
              $scope.canMove = true;
              $scope.switchShowAnnoZones = 'On';
              $scope.annZoneName = rectPrefix + divCounter;
              $scope.opacityFactorHighlight = "0.75";
              $scope.tagName = ""

            }
        };
    }
);
