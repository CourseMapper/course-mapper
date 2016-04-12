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

            templateUrl: '/partials/pdf-annotation-zone.html',
            //replace: true,
            //transclude: true,
            controller: function($http, $scope, $rootScope, $sce, $timeout, $parse){




/*              $scope.$watch('currCanWidth', function(newVal, oldVal){
              scope.localCanWidth = newVal;
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
                if(!$scope.isDragging){
                  $scope.addReference({id:annId});
                  $scope.isDragging=false;
                }
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

                $scope.localCanWidth = params[0];
                $scope.localCanHeight = params[1];
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


              $scope.canMove = $scope.dragable;
              $scope.annZoneID = $scope.listId;
              $scope.opacityFactorHighlight = "0.75";
              $scope.tagName = $scope.tagName.slice(1);
              $scope.dataRelCoord = $scope.relativePositionX+";"+$scope.relativePositionY;
              $scope.isDragging =false;

              $timeout(function(){
                $scope.$apply();
              });

              $timeout(function(){

                var thisElem = $("#caRect-" + $scope.divCounter);


                thisElem.find('select[name="colorpicker-change-background-color"]').simplecolorpicker({picker: true, theme: 'glyphicons'});

                thisElem.find('.simplecolorpicker').click(function(event){
                    event.stopPropagation();
                });
                thisElem.find('select[name="colorpicker-change-background-color"]').simplecolorpicker();


                thisElem.find('select[name="colorpicker-change-background-color"]').simplecolorpicker('selectColor', $scope.color);

                $('#destroy').on('click', function() {

                  $('select').simplecolorpicker('destroy');
                });
                // By default, activate simplecolorpicker plugin on HTML selects
                $('#init').trigger('click');

              });


            }
        };
    }
);
