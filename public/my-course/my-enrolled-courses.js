angular.module('MyEnrolledCourses', [''])
    .controller('CourseListEnrolledController', function($scope, $http) {
        $scope.headerTitle = "Course Name";
        $http.get('/api/my-course').success(function (data) {
            $scope.courseEnrolled = data.courses.enrolled;
            $scope.courseEnrolledLength = data.courses.enrolled.length;
            //created courses data
            $scope.courseCreated = data.courses.created;
            $scope.courseCreatedLength = data.courses.created.length;
        });
    });