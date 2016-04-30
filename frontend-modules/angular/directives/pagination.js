app.directive('pagination',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            scope: {
                totalRows: '=',
                limit: '=',
                useSearch: '=',
                terms: '=',
                objectService: '@',
                sortBy: '@',
                orderBy: '@',
                currentPage: '@',
                successCb: '=',
                lastPage: '@',
                setReset: '='
            },

            templateUrl: '/partials/pagination.html',

            link: function (scope, element, attrs) {
                attrs.$observe('objectService', function () {
                    var factoryInstance = element.injector().get(scope.objectService);
                    scope.objectServiceInstance = factoryInstance;
                    factoryInstance.setPageParams(scope);
                });

                attrs.$observe('terms', function () {
                    scope.terms = attrs.terms;
                });
            },

            controller: function ($http, $scope, $location) {
                $scope.showMoreButton = false;

                if ($scope.currentPage == undefined)
                    $scope.currentPage = 0;
                else
                    $scope.currentPage = parseInt($scope.currentPage);

                $scope.lastPage = $scope.currentPage * $scope.limit;

                $scope.$watch('totalRows', function () {
                    $scope.currentPage = parseInt($scope.currentPage);
                    if ($scope.totalRows / $scope.currentPage >= $scope.limit) {
                        $scope.showMoreButton = true;
                    } else
                        $scope.showMoreButton = false;
                });

                $scope.$watch('setReset', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $scope.currentPage = 1;
                        $scope.lastPage = $scope.currentPage * $scope.limit;
                    }
                });

                $scope.showMoreRows = function () {
                    $scope.objectServiceInstance.setPageParams($scope);
                    $scope.objectServiceInstance.getMoreRows(function (newRows, allRows) {
                        if (newRows) {
                            $scope.totalRows = newRows.length;
                            // show more button if it has possibilities of having more pages
                            if ($scope.totalRows >= $scope.limit) {
                                $scope.showMoreButton = true;
                            } else
                                $scope.showMoreButton = false;
                        }
                        else
                            $scope.showMoreButton = false;

                        $scope.successCb(newRows, allRows);
                    });

                    $scope.currentPage++;
                    $scope.lastPage = $scope.currentPage * $scope.limit;

                    if (!$scope.useSearch)
                        return;

                    $location.search('limit', $scope.limit);
                    $location.search('sortBy', $scope.sortBy);
                    $location.search('orderBy', $scope.orderBy);
                    $location.search('lastPage', $scope.lastPage);
                };
            }
        };
    });