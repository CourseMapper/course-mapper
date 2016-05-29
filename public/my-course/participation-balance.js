angular.module('ParticipationBalance', [''])
  .controller('ParticipationBalanceController', function ($scope, $http) {

    var coursesReceived = function (res) {
      $scope.courses = res.data.courses;

      $http.get('/api/treenodes/course')
    };

    $http.get('/api/my-course')
      .then(coursesReceived);
  });