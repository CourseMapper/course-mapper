angular.module('MyVideoStatus', [''])
  .controller('VideoStatusController', function ($scope, $http) {
    $http.get('/api/my-course/video-history').success(function (data) {
      $scope.videoHistory = data.videoHistory;
      $scope.sortType = 'dateUpdated';
      $scope.sortReverse = 'false';
    });
  });