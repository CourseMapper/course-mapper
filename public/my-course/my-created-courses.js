angular.module('MyCreatedCourses', [''])
    .controller('CourseListCreatedController', function($scope, $http) {
        $scope.headerTitle = "Course Name";
        $http.get('/api/my-course').success(function (data) {
            $scope.courseCreated = data.courses.created;
            $scope.courseCreatedLength = data.courses.created.length;
        });
    });