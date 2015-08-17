app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout) {


    $http.get('/slide-viewer/disAnnZones').success(function (data) {
        console.log('TAGS UPDATED');
        console.log(data);

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
});
