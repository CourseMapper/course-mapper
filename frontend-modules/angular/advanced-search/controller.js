app.controller('AdvancedSearchController', function ($scope, $http) {

  var search = function (term) {

    // Clear previous result
    $scope.result = null;
    $scope.relevant = null;

    // Check if search is empty
    if (!term || term.length == 0) {
      return;
    }

    setBusy(true);

    // Find matching results
    $http.get('/api/advanced-search?term=' + term)
      .success(function (data) {
        $scope.result = data;
        setBusy(false);
      });

    //TODO
    // Find relevant results
    $http.get('/api/advanced-search?term=' + term)
      .success(function (data) {
        $scope.relevant = data;
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
    $scope.relevant = null;
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