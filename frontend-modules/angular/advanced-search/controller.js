app.controller('AdvancedSearchController', function ($rootScope, $scope, $http, $routeParams, $location) {

    var queries = {};
    var loadRelevant = function (term) {
        if (queries[term]) {
            $scope.relevant = queries[term];
            return;
        }
        $http.get('/api/relevant-search?term=' + term + '&resources=contentNodes,courses')
            .success(function (data) {
                $scope.relevant = _.take(_.shuffle(data), 5);
                queries[term] = $scope.relevant;
                setBusy(false);
            });
    };

    var loadPopular = function (term) {
        $http.get('/api/relevant-search?term=' + term + '&resources=courses')
            .success(function (data) {
                orderPopular(data);
                setBusy(false);
            });
    };

    var orderPopular = function (data) {
        $scope.popular = _.take(_.sortBy(data, $scope.popularBy, 'desc'), 10);
    };

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
        var user = $rootScope.user;
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

        // Configure network query
        switch ($scope.network) {
            case "owned":
                query += '&owner=' + user._id;
                break;
        }

        // Find matching results
        $http.get('/api/advanced-search' + query)
            .success(function (data) {

                var startAt = $scope.filterDate.startDate;
                var endAt = $scope.filterDate.endDate;

                if (startAt && endAt) {
                    $scope.result = _.filter(data, function (o) {
                        return $scope.filterDate.startDate.isBefore(o.updated) &&
                            $scope.filterDate.endDate.isAfter(o.updated);
                    });
                }
                else {
                    $scope.result = data;
                }

                setBusy(false);

                loadRelevant(term);
                loadPopular(term);
            });
    };

    var setBusy = function (isBusy) {
        $scope.isBusy = isBusy;
    };

    function init() {

        setBusy(false);
        $scope.popularBy = '-activity';
        $scope.result = null;
        $scope.relevant = null;
        $scope.network = 'global';
        $scope.resources = {
            categories: {selected: true},
            contentNodes: {selected: true},
            courses: {selected: true},
            videoAnnotations: {selected: false},
            pdfAnnotations: {selected: false},
            extResources: {selected: false}
        };

        $scope.filterDate = {startDate: null, endDate: null};

        // Monitor changes of filters
        $scope.$watch('network', search);
        $scope.$watch('resources', search, true);
        $scope.$watch('filterDate', search, true);
        $scope.$watch('popularBy', function () {
            loadPopular($scope.searchTerm);
        }, true);

        // Subscribe to menu query text changes
        $scope.$on('searchQueryChanged', function (event, args) {
            $scope.searchTerm = args.state;
            search();
        })
    }

    // Initialize controller
    init();
});