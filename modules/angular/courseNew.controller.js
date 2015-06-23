
app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.course = {
        name: null,
        category: null,
        description: ''
    };

    $scope.createdDate = new Date();

    $scope.saved = false;
    $scope.categories = [];

    $scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category._id + '/courseTags?query=' + query);
    };

    $scope.saveCourse = function() {
        if($scope.course.tags) {
            $scope.course.tags = JSON.stringify($scope.course.tags);
        }

        var d = transformRequest($scope.course);
        $http({
            method: 'POST',
            url: '/api/courses',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                $scope.course = {};
                console.log(data);
                if(data.result) {
                    $scope.$emit('onAfterCreateNewCourse');
                    window.location.href = '/course/' + data.course.shortId + '?new=1';
                }
            })
            .error(function(data){
                $scope.course.tags = JSON.parse($scope.course.tags);
                if( data.result != null && !data.result){
                    $scope.errorName = data.errors.name;
                    console.log(data.errors);
                }
            });
    };
});

