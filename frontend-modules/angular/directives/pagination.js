app.directive('pagination',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            scope: {
                totalRows: '=',
                limit: '=',
                useSearch: '=',
                objectService: '@',
                sortBy: '@',
                orderBy: '@',
                successCb: '='
            },

            templateUrl: '/angular/views/pagination.html',

            link: function (scope, element, attrs) {
                attrs.$observe('objectService', function () {
                    var factoryInstance = element.injector().get(scope.objectService);
                    scope.objectServiceInstance = factoryInstance;
                    factoryInstance.setPageParams(scope);
                });
            },

            controller: function ($http, $scope, $location) {
                $scope.showMoreButton = false;
                $scope.currentPage = 1;
                $scope.lastPage = $scope.currentPage * $scope.limit;

                $scope.$watch('totalRows', function () {
                    if ($scope.totalRows / $scope.currentPage >= $scope.limit) {
                        $scope.showMoreButton = true;
                    } else
                        $scope.showMoreButton = false;
                });

                $scope.showMoreRows = function () {
                    $scope.objectServiceInstance.setPageParams($scope);
                    $scope.objectServiceInstance.getMoreRows(function (newRows, allRows) {
                        $scope.totalRows = newRows.length;
                        // show more button if it has possibilities of having more pages
                        if ($scope.totalRows >= $scope.limit) {
                            $scope.showMoreButton = true;
                        } else
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