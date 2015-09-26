app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout, $injector) {

    $scope.storedAnnZones = [];
    $scope.storedAnnZoneColors = [];
    $scope.tagNames = "";

    /*$scope.$watchCollection("storedAnnZones",function(newValue,oldValue){
      console.log($scope.storedAnnZones);
    });*/



    $scope.refreshTags = function() {
      $http.get('/slide-viewer/disAnnZones/' + $scope.pdfFile._id + '/'+$scope.currentPageNumber).success(function (data) {
        //console.log('TAGS UPDATED OF PAGE ' + $scope.currentPageNumber);
        $scope.annZones = data.annZones;

        tagListLoaded($scope.annZones);

        $timeout(function(){
          $scope.$apply();
        });


        /*$scope.$on('$stateChangeSuccess', function(){
          console.log("ALL DONE AJS");
        });
        */

      });
    };




    $rootScope.$on('onPdfPageChange', function(e, newSlideNumber){
      $scope.$emit('reloadTags');
    });

    $scope.$on('reloadTags', function(event) {
      console.log("LOADED RESET");
      $(".slideRect").remove();

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];
      $scope.refreshTags();
    });

    /*
    use onPdfPageChange event instead
    $scope.$watch("currentPageNumber",function(newValue,oldValue){
      //console.log("LOADED RESET");
      $(".slideRect").remove();

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];
      $scope.refreshTags();
    });*/

    $scope.compileMovableAnnotationZone = function(element) {
      return angular.element(
        $injector.get('$compile')(element)($scope)
      );
    };

    $scope.$watch("tagNames", function (newValue, oldValue) {
      for(var key in newValue) {
        console.log(newValue[key]);
        var response = checkTagName(newValue[key]);
        if(response.length != 0) {
          //TODO: failure
        }
        else {
          //TODO:success
        }
      }
    },true);

    function checkTagName(tagName) {
      if(!(tagName.length >= 4)) {
          return "Annotation zone name is too short (>3 characters)";
      }
      if(!(tagName.length < 10)) {
          return "Annotation zone name is too long (<10 characters)";
      }
      //TODO: check if already exists

      return "";
    }

    //$scope.refreshTags();
});
