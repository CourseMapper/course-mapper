
app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.submitted = false;
    $scope.isLoading = false;
    $scope.errors = [];

    $scope.course = {
        name: null,
        category: null,
        description: '',
        smallDescription: ''
    };

    $scope.tagsRaw = null;
    $scope.errors = [];

    $scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category._id + '/courseTags?query=' + query);
    };

    $scope.saveCourse = function(isValid) {
        if (isValid) {

            if ($scope.tagsRaw) {
                $scope.course.tags = JSON.stringify($scope.tagsRaw);
            }

            $scope.course.category = $scope.$parent.category._id;

            $scope.isLoading = true;
            var d = transformRequest($scope.course);
            $http({
                method: 'POST',
                url: '/api/courses',
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (data) {
                    console.log(data);
                    if (data.result) {
                        $scope.$emit('onAfterCreateNewCourse');
                        window.location.href = '/course/' + data.course.slug + '/#/cid/' + data.course._id + '?new=1';
                    }

                    $scope.isLoading = false;
                })
                .error(function(data){
                    $scope.isLoading = false;
                    $scope.errors = data.errors;
                });
        }
    };
});
