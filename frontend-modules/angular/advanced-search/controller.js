app.controller('AdvancedSearchController', function ($rootScope, $scope, $http) {

  var search = function () {

    var term = $scope.searchTerm;

    // Check if search is empty
    if (!term || term.length == 0) {
      // Clear previous result
      $scope.result = null;
      $scope.relevant = null;
      return;
    }

    setBusy(true);

    // Build query
    var user = $rootScope.user
    var query = '?term=' + term;

    switch ($scope.network) {
      case "personal":
        query += '&owner=' + user._id;
        break;
    }

    // Find matching results
    $http.get('/api/advanced-search' + query)
      .success(function (data) {
        $scope.result = data;
        setBusy(false);
      });

    //TODO Find relevant results
    $http.get('/api/relevant-search?term=' + term)
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
    $scope.network = 'global';

    // Monitor changes of filters
    $scope.$watch('network', search);

    // Subscribe to menu query text changes
    $scope.$on('searchQueryChanged', function (event, args) {
      $scope.searchTerm = args.state;
      search();
    })
  }

  // Initialize controller
  init();
});