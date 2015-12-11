app.directive('pdfAnnotationZone',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,
            require: 'movable-pdf',
            scope: {
              relativePositionX: '=',
              relativePositionY: '=',
              relativeSizeX: '=',
              relativeSizeY: '=',
              color: '=',
              tagName: '=',
              editTagNameTemp: '=',
              dragable: '=',
              isBeingCreated: '=',
              canBeEdited: '=',
              annZoneId: '=',
              divCounter: '=',
              listId: '=',
              switchShowAnnoZones: '=',
              tagNameIsValidated: '=',
              setEditZoneMode: '&',
              resetEditZoneMode: '&',
              updateAnnZone: '&',
              removeAnnotationZone: '&',
              addReference: '&',
            },

            templateUrl: '/angular/views/pdf-annotation-zone.html',
            //replace: true,
            //transclude: true,
            controller: function($http, $scope, $rootScope, $sce, $timeout, $parse){



              console.log("Got called");

/*              $scope.$watch('currCanWidth', function(newVal, oldVal){
                console.log("HERE");
                $scope.localCanWidth = newVal;
              });

              $scope.$watch('currCanHeight', function(newVal, oldVal){
                $scope.localCanHeight = newVal;
              });
*/

              $scope.localCanWidth = $('#annotationZone').width();
              $scope.localCanHeight = $('#annotationZone').height();

              $scope.localSetEditZoneMode = function(annId){
                $scope.setEditZoneMode({id:annId});
              };

              $scope.localResetEditZoneMode = function(){
                $scope.resetEditZoneMode();
              };

              $scope.localUpdateAnnZone = function(annId){
                $scope.updateAnnZone({id:annId});
              };

              $scope.localRemoveAnnotationZone = function(annId){
                $scope.removeAnnotationZone({id:annId});
              };

              $scope.localAddReference = function(annId){
                $scope.addReference({id:annId});
              };


              $scope.updateAnnZonePos = function(posSize){
                $scope.relativePositionY=posSize.position.top;
                $scope.relativePositionX= posSize.position.left;
                if(posSize.size != undefined){
                  $scope.relativeSizeX = posSize.size.width;
                  $scope.relativeSizeY = posSize.size.height;
                }
                $timeout(function(){
                  $scope.$apply();
                });
              };



              $rootScope.$on('pdfScaleChanged', function(event,params){
                console.log("Blub");

                $scope.localCanWidth = params[0];
                $scope.localCanHeight = params[1];
                console.log($scope.localCanWidth);
                $timeout(function(){
                  $scope.$apply();
                });
              });

              $scope.inEditMode = false;

              $rootScope.$on('editZoneModeChanged', function(event,param){
                if($scope.listId == param){
                  $scope.inEditMode = true;
                }
                else {
                  $scope.inEditMode = false;
                }
              });


              //console.log($scope.relativePosition);
              $scope.canMove = $scope.dragable;
              //$scope.switchShowAnnoZones = 'On';
              $scope.annZoneID = $scope.listId;
              //$scope.annZoneId = "";
              $scope.opacityFactorHighlight = "0.75";
              $scope.tagName = $scope.tagName.slice(1);
              //$scope.color ="#444444";
              $scope.dataRelCoord = $scope.relativePositionX+";"+$scope.relativePositionY;
              $scope.colorPickerId ="1";

              //$scope.divCounter = "1";



              //$scope.setEditZoneMode = function(a,b,c){;};

              $timeout(function(){
                $scope.$apply();
              });


              $('select[name="colorpicker-change-background-color"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
              //console.log("TESTTTTTTTTTTTT______"+"#colorPickerSingleSelector-"+$scope.divCounter);

              //$().simplecolorpicker("selectColor",$scope.color);
              $('#destroy').on('click', function() {

                $('select').simplecolorpicker('destroy');
              });
              // By default, activate simplecolorpicker plugin on HTML selects
              $('#init').trigger('click');


              $scope.positionStyle = {  'top' : $scope.relativePositionX*$scope.localCanWidth+"px",
                                        'left' : $scope.relativePositionY*$scope.localCanWidth+'px',
                                        'width': $scope.relativeSizeX*$scope.localCanWidth+'px',
                                        'height':$scope.relativeSizeY*$scope.localCanHeight+'px'
                                      };

            }
        };
    }
);
