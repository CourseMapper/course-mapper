app.controller('AdvancedSearchController', function ($rootScope, $scope, $http) {

  var loadRelevant = function (term, data) {
    //TODO Find relevant results
    $http.get('/api/relevant-search?term=' + term)
      .success(function (data) {
        $scope.relevant = data;
        setBusy(false);
      });
  }

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

    // Configure resource query
    var allowedResources = [];
    for (var resourceType in $scope.resources) {
      var r = $scope.resources[resourceType];
      if (r.selected) {
        allowedResources.push(resourceType);
      }
    }
    query += '&resources=' + allowedResources.join();

    // Configure network queyr
    switch ($scope.network) {
      case "personal":
        query += '&owner=' + user._id;
        break;
    }

    console.log(query);
    
    // Find matching results
    $http.get('/api/advanced-search' + query)
      .success(function (data) {
        $scope.result = data;
        setBusy(false);

        // Load extra relevant resources
        loadRelevant(term, data);
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
    $scope.resources = {
      categories: { selected: true },
      contentNodes: { selected: true },
      courses: { selected: true },
      videoAnnotations: { selected: true },
      pdfAnnotations: { selected: true }
    };

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