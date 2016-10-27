app.controller('AdvancedSearchController', function ($rootScope, $scope, $http) {

  var search = function (term) {
    
    // Check if search is empty
    if (!term || term.length == 0) {
      $scope.result = null;
      return;
    }

    // Load search results data
    setBusy(true);
    $http.get('/api/advanced-search?term=' + term)
      .success(function (data) {
        $scope.result = data;
        setBusy(false);
      });
  }

  var setBusy = function (isBusy) {
    $scope.isBusy = isBusy;
  }

  function init() {
    setBusy(false);
    $scope.searchTerm = '';
    $scope.result = [];
    $scope.search = search;
  }

  // Initialize controller
  init();

});