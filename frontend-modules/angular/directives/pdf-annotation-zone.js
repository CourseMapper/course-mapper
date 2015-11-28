app.directive('pdfAnnotationZone',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,
            require: 'movable-pdf',
            scope: {

            },

            templateUrl: '/angular/views/pdf-annotation-zone.html',
            //replace: true,
            //transclude: true,
            controller: function($http, $scope, $rootScope, $sce, $timeout){
              $scope.canMove = true;
              $scope.switchShowAnnoZones = 'On';
              $scope.annZoneID = rectPrefix + divCounter;
              $scope.annZoneId = "";
              $scope.opacityFactorHighlight = "0.75";
              $scope.tagName = "";
              $scope.color ="#444444";
              $scope.dataRelCoord = "100;100";
              $scope.colorPickerId ="1";
              $scope.divCounter = "1";
              $scope.color = "";
              $scope.editZoneMode = "BLUB";



              $scope.setEditZoneMode = function(a,b,c){;};

              $timeout(function(){
                $scope.$apply();
              });


              $('select[name="colorpicker-change-background-color"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
              $('#destroy').on('click', function() {
                $('select').simplecolorpicker('destroy');
              });
              // By default, activate simplecolorpicker plugin on HTML selects
              $('#init').trigger('click');


            }
        };
    }
);
