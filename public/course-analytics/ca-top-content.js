angular.module('TopContent', [''])
    .controller('TopContentController', function($scope, $http, $location) {
        $scope.HeaderTitle = "Top Content";

        var loc = $location.path();
        var parseLoc = loc.replace ('/cid/', '');
        //alert(parseLoc);
        if (parseLoc) {

            $http.get('/api/course-analytics/top-content/pdf-annotation/' + parseLoc).success(function (data) {
                $scope.topAnnotatedPdf = data.topAnnotatedPdf;

            });
            $http.get('/api/course-analytics/top-content/video-annotation/' + parseLoc).success(function (data) {
                $scope.topAnnotatedVideo = data.topAnnotatedVideo;

            });

            $http.get('/api/course-analytics/top-content/link-node/' + parseLoc).success(function (data) {
                $scope.topLinkNode = data.topLinkNode;

            });

        } else
            console.log('cannot get courseId in analytic widget');

    });