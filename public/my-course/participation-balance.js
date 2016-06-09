angular.module('ParticipationBalance', [''])

  .controller('ParticipationBalanceController', function ($scope, $http) {

    $scope.loadCourses = function (res) {
      $scope.courses = res.data;
    };

    $scope.init = function () {
      $http.get('/api/my-course/participation-balance').then($scope.loadCourses);
    };

    $scope.init();
  });