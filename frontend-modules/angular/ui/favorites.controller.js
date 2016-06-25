app.controller('FavoritesController', function ($rootScope, $scope, $http) {

  $scope.favorites = null;

  var loadFavorites = function () {
    $http.get('/api/favorites').then(
      function (result) {
        $scope.favorites = result.data;
      },
      function () {
        $scope.favorites = null;
      });
  };

  var favListener = $rootScope.$on('favorites.update', function () {
    loadFavorites();
  });

  loadFavorites();

  $scope.$on('$destroy', favListener);
});