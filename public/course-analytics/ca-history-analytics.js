
angular.module('HistoryAnalytics', ['chart.js'])
.controller("BarHistoryAnalyticsController", ['$scope', function ($scope) {
    $scope.title = "Course Analytics History Chart";
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September"];

    $scope.dataViews = [[65, 59, 80, 81, 56, 55, 40, 81, 22]];
    $scope.dataFollowingUsers = [[2, 5, 8, 10, 12, 11, 14, 17, 22]];
    $scope.dataLikes = [[7, 5, 1, 5, 5, 9, 12, 13, 20]];
    $scope.dataComments = [[4, 15, 12, 1, 17, 8, 15, 8, 2]];


}]);