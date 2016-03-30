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

        $scope.contentNodeActivityLabels = ["Link Submitted", "Pdf Annotations", "Video Annotations"];
        $http.get('/api/my-course/newsfeed').success(function (data) {
            var lcAll = $filter('filter')(data.newsfeed, { actionSubject: "link" });
            $scope.linkCount = $filter('filter')(lcAll, {actionType: "added"}).length;
            var pdfAnnoAll = $filter('filter')(data.newsfeed, { actionSubject: "pdf annotation" });
            $scope.pdfAnnoCount = $filter('filter')(pdfAnnoAll, { actionType: "added" }).length;
            var videoAnnoAll = $filter('filter')(data.newsfeed, { actionSubject: "video annotation" });
            $scope.videoAnnoCount = $filter('filter')(videoAnnoAll, { actionType: "added" }).length;
            $scope.contentNodeActivityData = [$scope.linkCount, $scope.pdfAnnoCount, $scope.videoAnnoCount ];

        });

        $scope.nodeActivityLabels = ["Discussion Started", "Pdf Added", "Video Added"];
        $http.get('/api/my-course/resources').success(function (data) {
            var courseResources = data.resources;
            var filtered;
            filtered  = $filter('filter')(courseResources, {type: 'pdf'});
            filtered = $filter('filter')(filtered, {isDeleted: false});
            $scope.pdfCount = filtered.length;

            var filtered2;
            filtered2 = $filter('filter')(courseResources, {isDeleted: false}).length;
            $scope.videoCount = filtered2 - filtered.length;

            $http.get('/api/my-course/newsfeed').success(function (data) {
                var filtered;
                filtered = $filter('filter')(data.newsfeed, {actionSubject: "discussion"});
                filtered = $filter('filter')(filtered, {actionType: "added"});

                $scope.discussionCount = filtered.length;
                $scope.nodeActivityData = [ $scope.discussionCount, $scope.pdfCount, $scope.videoCount];
            });
        });
        
    }]);
