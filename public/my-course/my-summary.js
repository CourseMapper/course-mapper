angular.module('MySummary', ['chart.js'])
.controller('RadarSummaryController', function($scope){
    $scope.title = "My Course Summary";
    $scope.labels = [ "PDF Read", "Video Watched", "Comments", "Likes", "Course Follow" ];
    $scope.data = [[92, 101, 77, 82, 9]];
});