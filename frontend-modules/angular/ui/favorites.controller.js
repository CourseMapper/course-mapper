app.controller('FavoritesController', function ($rootScope, $scope, $http) {

  var loadFavorites = function () {
    $http.get('/api/favorites')
      .success(function (data) {
        $scope.favorites = data;
        console.log(data)
      });
  };

  var favListener = $rootScope.$on('favorites.update', function () {
    loadFavorites();
  });

  loadFavorites();

  $scope.$on('$destroy', favListener);
});