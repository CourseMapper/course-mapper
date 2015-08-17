app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout) {


    $http.get('/slide-viewer/disAnnZones').success(function (data) {
        console.log('TAGS UPDATED');
        console.log(data);

        $scope.annZones = data.annZones;

        /*$scope.$on('$stateChangeSuccess', function(){
          console.log("ALL DONE AJS");
        });
        */
        $timeout(function(){
          $scope.$apply();
        });
    });
});
