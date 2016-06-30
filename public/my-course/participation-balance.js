angular.module('ParticipationBalance', [''])
  .controller('ParticipationBalanceController', function ($scope, $http) {

    function buildHSL(h, s, l) {
      return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    }

    function normalizeValue(value) {
      if (!value) {
        return 0.0;
      } else if (value > 1.0) {
        return 1.0;
      } else if (value < 0.0) {
        return 0.0;
      }
      return value;
    }

    $scope.percentToHSLColor = function (value, colorful) {
      var normalizedValue = normalizeValue(value);

      var h, l, s;
      if (colorful === true) {
        h = (1.0 - normalizedValue) * 320;
        l = 120 * normalizedValue;
        s = normalizedValue ? 50 : 90;
      }
      else {
        h = 202;
        l = 52;
        s = 100 - normalizedValue * 50;
      }
      return buildHSL(h, l, s);
    };

    //get participation balance percentage
    $scope.getPBP = function (node) {
      return node.totalAnnotations > 0 ? (node.userAnnotations / node.totalAnnotations).toFixed(2) : 0
    };

    $scope.init = function () {
      $http.get('/api/my-course/participation-balance')
        .then(function (res) {
          $scope.courses = res.data;
          console.log(res.data)
        });
    };

    $scope.init();
  });