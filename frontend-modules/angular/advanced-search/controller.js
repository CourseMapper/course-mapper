app.controller('AdvancedSearchController', function ($rootScope, $scope, $http) {

  var search = function (term) {

    // Clear previous result
    $scope.result = null;

    // Check if search is empty
    if (!term || term.length == 0) {
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
    $scope.result = null;
    $scope.search = search;

    // Subscribe to menu query text changes
    $scope.$on('searchQueryChanged', function (event, args) {
      var query = args.state;
      search(query);
    })
  }

  // Initialize controller
  init();

});