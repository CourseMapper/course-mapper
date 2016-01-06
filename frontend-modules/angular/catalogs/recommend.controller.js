app.controller('RecommendController', function ($scope, $filter, $http, toastr, Page) {
    $scope.submitted = false;
    $scope.isLoading = false;
    $scope.errors = [];

    $scope.category = {
        name: '',
        description: ''
    };

    Page.setTitleWithPrefix('Recommend a Category');

    $scope.recommend = function (isValid) {
        if (isValid) {

            $scope.isLoading = true;
            var d = transformRequest($scope.category);
            $http({
                method: 'POST',
                url: '/api/categories/recommend',
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    console.log(data);
                    if (data.result) {
                        toastr.success('Recommendation saved');
                    }

                    $scope.isLoading = false;

                    $scope.category = {
                        name: '',
                        description: ''
                    };

                    $scope.recommendForm.$setPristine();
                })
                .error(function (data) {
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                    toastr.success('Sending recommendation failed');

                    $scope.category = {
                        name: '',
                        description: ''
                    }

                });
        }
    };
});
