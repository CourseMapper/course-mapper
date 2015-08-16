app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout) {


    //function updateScope(url){
      //$http.get(url).success(function (data) {
    $http.get('/slide-viewer/disAnnZones').success(function (data) {
        console.log('TAGS UPDATED');
        console.log(data);

        $scope.annZones = data.annZones;

        $timeout(function(){
          $scope.$apply();
        });

      //});
    });

    /*$scope.$watch("annZones",function(newValue,oldValue){
      $scope.getUrl = '/slide-viewer/disAnnZones';
      updateScope($scope.getUrl);
    });*/


});
