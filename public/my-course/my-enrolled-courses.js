angular.module('MyEnrolledCourses', [''])
    .controller('CourseListEnrolledController', function($scope, $http) {
        $scope.title = "List of Enrolled and Created Courses";
        $http.get('/api/my-course').success(function (data) {
            $scope.courseCreated = data.courses.created;
            $scope.courseCreatedLength = data.courses.created.length;
            $scope.courseEnrolled = data.courses.enrolled;

        });
    });