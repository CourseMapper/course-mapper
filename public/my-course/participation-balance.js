angular.module('ParticipationBalance', [''])
  .controller('ParticipationBalanceController', function ($scope, $http) {

    $scope.init = function () {
      $http.get('/api/my-course/participation-balance')
        .then(function (res) {
          $scope.courses = res.data;
          console.log(res.data)
        });
    };

    $scope.init();
  });