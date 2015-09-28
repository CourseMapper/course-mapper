angular.module('MySummary', ['chart.js'])
.controller('RadarSummaryController', function($scope){
    $scope.title = "My Course Summary";
    $scope.labels = ["Video Watched", "PDF Read", "Course Follow", "Likes", "Comments"];
    $scope.data = [[65, 59, 5, 81, 56]];
    //$scope.labels =["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];
    //$scope.data = [[28, 48, 40, 19, 96, 27, 100]];
});