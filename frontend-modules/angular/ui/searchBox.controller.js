app.controller('SearchBoxController', function ($scope, $http) {

  $scope.isEmpty = function () {
    var str = $scope.queryText;
    return (!str || /^\s*$/.test(str));
  };

  $scope.hasResults = function () {
    var r = $scope.result;
    return r != null && (
        r.categories.length > 0 ||
        r.courses.length > 0 ||
        r.videoAnnotations.length > 0 ||
        r.pdfAnnotations.length > 0 ||
        r.contentNodes.length > 0
      );
  };

  $scope.$watch('queryText', function (searchTerm) {
    if (!searchTerm || searchTerm.length == 0) {
      $scope.result = null;
      return;
    }

    if (searchTerm === $scope.queryText) {
      $http.get('/api/search?term=' + searchTerm)
        .success(function (data) {
          $scope.result = data;
        });
    }
  });
});