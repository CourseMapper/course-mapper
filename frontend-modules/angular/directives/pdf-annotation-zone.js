app.directive('pdfAnnotationZone',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,
            require: 'movable',
            scope: {

            },

            templateUrl: '/angular/views/pdf-annotation-zone.html',

            controller: function($http, $scope, $rootScope, $sce){
              $scope.canMove = true;
              $scope.switchShowAnnoZones = 'On';
              $scope.annZoneID = rectPrefix + divCounter;
              $scope.opacityFactorHighlight = "0.75";
              $scope.tagName = ""
              $scope.color ="#444444"
              $scope.dataRelCoord = "100;100"

            }
        };
    }
);
