angular.module('MyCoursesBreakdown', [])
    .controller('CoursesBreakdownController', function($scope, $http) {
        //$scope.title = "List of PDF History";



        $http.get('/api/my-course').success(function (data) {
            $scope.courseEnrolled = data.courses.enrolled;
            $scope.courseEnrolledLength = data.courses.enrolled.length;

        });

        //example accordion data
        $scope.oneAtATime = false;

        $http.get('/api/my-course/enrolled-resources').success(function (data) {
            $scope.courseEnrolledResources = data.resources;

        });

        $http.get('/api/my-course/newsfeed').success(function (data) {
            $scope.newsfeedData  = data.newsfeed;
        });


        //filtering scope
        $scope.isPdfAnno = function (action) {
            return action.actionSubject == 'pdf annotation';
        };
        $scope.isVideoAnno = function (action) {
            return action.actionSubject == 'video annotation';
        };
        $scope.isDiscussion = function (action) {
            return action.actionSubject == 'discussion';
        };
        $scope.isLink = function (action) {
            return action.actionSubject == 'link';
        };
        $scope.isAdded = function (action) {
            return action.actionType == 'added';
        };

        //filtering scope resources
        $scope.isPdf = function (action) {
            return action.type == 'pdf';
        };
        $scope.isVideo = function (action) {
            return action.type != 'pdf';
        };
    });
