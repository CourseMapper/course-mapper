app.controller('SearchBoxController', function ($scope, $http, $rootScope) {

  $scope.categoryClicked = function () {
    console.log('xaxa')
  };

  $scope.$watch('queryText', function (searchTerm) {
    if (!searchTerm || searchTerm.length == 0) {
      return 0;
    }
    if (searchTerm === $scope.queryText) {
      $http.get('/api/search?term=' + searchTerm)
        .success(function (data) {
          $scope.courses = data.courses;
          $scope.categories = data.categories;
          $scope.annotations = data.annotations;
        });
    }
  });
});