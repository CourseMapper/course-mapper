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

       /* $http.get('/api/my-course/newsfeed').success(function (data) {
            $scope.newsfeedData  = data.newsfeed;
        });*/

        $http.get('/api/my-course/my-node-activity-status').success(function (data) {
            $scope.myNodeActivity  = data.myNodeActivityStatus;
        });

        $http.get('/api/my-course/my-discussion-status').success(function (data) {
            $scope.myDiscussionStatus  = data.myDiscussionStatus;
        });


        //filtering scope
        $scope.isPdfAnno = function (action) {
            return action.type == 'pdf annotation';
        };
        $scope.isVideoAnno = function (action) {
            return action.type == 'video annotation';
        };
        $scope.isDiscussion = function (action) {
            return action.type == 'discussion';
        };
        $scope.isLink = function (action) {
            return action.type == 'link';
        };
        $scope.isExtResource = function (action) {
            return action.type == 'ext-resource';
        };
        $scope.isAdded = function (action) {
            return action.actionType == 'added';
        };
        $scope.isThisDeleted = function (action) {
            return action.actionType == 'deleted';
        };
        $scope.isTrue = function (action) {
            return action.isDeleted == false;
        };


        //filtering scope resources
        $scope.isPdf = function (action) {
            return action.type == 'pdf';
        };
        $scope.isVideo = function (action) {
            return action.type != 'pdf';
        };
    });
