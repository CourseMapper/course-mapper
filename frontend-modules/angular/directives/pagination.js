app.directive('pagination',
    function ($compile, $timeout) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                lastId: '=',
                totalRows: '=',
                limit: '=',
                useSearch: '=',
                objectService: '@',
                sortBy: '@',
                orderBy: '@'
            },

            templateUrl: '/angular/views/pagination.html',

            link: function (scope, element, attrs) {
                attrs.$observe('lastId', function(lastId){
                    var factoryInstance = element.injector().get(scope.objectService);
                    factoryInstance.setPageParams(scope);
                });
            },

            controller: function ($http, $scope, $location) {
                $scope.showMoreButton = false;

                $scope.$watch('totalRows', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        // show more button if it has possibilities of having more pages
                        if ($scope.totalRows == $scope.limit) {
                            $scope.showMoreButton = true;
                        } else
                            $scope.showMoreButton = false;
                    }
                });

                $scope.showMoreRows = function () {
                    if (!$scope.useSearch)
                        return;

                    $location.search('limit', $scope.limit);
                    $location.search('sortBy', $scope.sortBy);
                    $location.search('orderBy', $scope.orderBy);
                    $location.search('lastId', $scope.lastId);
                };
            }
        };
    });