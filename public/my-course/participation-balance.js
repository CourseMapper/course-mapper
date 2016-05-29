angular.module('ParticipationBalance', [''])
  .controller('ParticipationBalanceController', function ($scope, $http) {

    $http.get('/api/my-course/participation-balance')
      .then(function (res) {
        $scope.courses = res.data;
      });
  });