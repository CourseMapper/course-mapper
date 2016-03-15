angular.module('MyCoursesBreakdown', ['ngAnimate','ui.bootstrap'])
    .controller('CoursesBreakdownController', function($scope, $http) {
        //$scope.title = "List of PDF History";


        $http.get('/api/my-course').success(function (data) {
            $scope.courseEnrolled = data.courses.enrolled;
            $scope.courseEnrolledLength = data.courses.enrolled.length;
            //created courses data
            $scope.courseCreated = data.courses.created;
            $scope.courseCreatedLength = data.courses.created.length;
        });

        //example accordion data
        $scope.oneAtATime = false;

        $http.get('/api/my-course/enrolled-resources').success(function (data) {
            $scope.courseEnrolledResources = data.resources;

        });

    });
