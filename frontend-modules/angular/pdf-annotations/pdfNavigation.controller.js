/*
moved to directive
app.controller('PDFNavigationController', function($scope, $http, $rootScope, $sce, $timeout) {
    $scope.currentPageNumber = 1;
    $scope.maxPageNumber = 30;

    $scope.changePageNumber = function(value){
      //console.log("GOT CALLED");
      if( ($scope.currentPageNumber + value) <= $scope.maxPageNumber && ($scope.currentPageNumber + value) >= 1)
        $scope.currentPageNumber = $scope.currentPageNumber + value;
        $timeout(function(){
          $scope.$apply();
          pdfIsLoaded = false;
          changeSlide($scope.currentPageNumber);
        });

    }


});*/
