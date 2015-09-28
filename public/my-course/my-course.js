/**
 * example of a separate module and controller for your widget.
 * the file name has to be the same as its folder name, which is saved in
 * the model "widgets" inside a key "application"
 *
 * the module and controller name is up to you
 *
 * this file will be "lazy loaded" by OCLazyLoad.
 * the load is done in widget.controller.js after the app is getting the user/owner installed widget.
 *
 */
//Old controller
// angular.module('MyCourseApp', []).
//     controller('BeController', function($scope, $http) {
//         $http.get('/api/categories').success(function (data) {
//             $scope.categories = data.categories;
//             $scope.halo = "hallo";
//         });
//     });
angular.module('MyCourseApp', ['chart.js'])
.controller("BarProgressController", ['$scope', '$timeout', function ($scope, $timeout) {
	$scope.title = "My Course Progress History Chart";
	$scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
	$scope.series = ['Video Watched', 'PDF Read'];
	$scope.data = [
		[65, 59, 80, 81, 56, 55, 40],
		[28, 48, 40, 19, 86, 27, 90]
	];
	$scope.onClick = function (points, evt) {
		console.log(points, evt);
	};

	// Simulate async data update
	$timeout(function () {
		$scope.data = [
		  [28, 48, 40, 19, 86, 27, 90],
		  [65, 59, 80, 81, 56, 55, 40]
		];
	}, 3000);
}]);




