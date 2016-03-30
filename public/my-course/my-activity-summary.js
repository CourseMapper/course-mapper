/**
 * example of a separate module and controller for your widget.
 * the file name has to be the same as its folder name, which is saved in
 * the model "widgets" inside a key "application"
 *
 * the module and controller name is up to you
 *
 * this file will be "lazy loaded" by OCLazyLoad.
 * the load is done in widget.controller.js after the app is getting the user/owner installed widget.
 *
 */
angular.module('MyProgress', ['chart.js'])
    .controller("BarProgressController", ['$scope', '$timeout', '$http', '$filter', function ($scope, $timeout, $http, $filter) {
        $http.get('/api/my-course').success(function (data) {
            $scope.courseCreated = data.courses.created;
            $scope.courseEnrolled = data.courses.enrolled;
        });

        $http.get('/api/my-course/newsfeed').success(function (data) {
            $scope.linkCount = $filter('filter')(data.newsfeed, { actionSubject: "link" }).length;
            /*$scope.totalVideo = function(){
                var count = 0;
                angular.forEach(data, function(video){
                    count += video.actionSubject
                })
            };*/

            //$scope.newsfeedData  = data.newsfeed;
        });




        $scope.labelsPie = ["Video Added", "Pdf Added", "Discussion"];
        $scope.labelsPie2 = ["Video Annotations", "Pdf Annotations", "Links"];
        $scope.dataPie = [300, 500, 100];

        $scope.myPDFReadData = [[12, 19, 6, 10, 12, 14, 12, 2, 5]];
        $scope.myVideoWatchedData = [[2, 5, 8, 10, 12, 11, 14, 17, 22]];
        $scope.myCommentsMadeData = [[7, 5, 1, 5, 5, 9, 12, 13, 20]];
        $scope.myLikesData = [[4, 15, 12, 1, 17, 8, 15, 8, 2]];
        $scope.myFollowingCoursesData = [[0, 2, 0, 0, 1, 3, 1, 0, 2]];
        var ax= 12, bx = 70, cx = 29;
        $scope.pushedData = [ax, bx, cx];

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

    }]);
