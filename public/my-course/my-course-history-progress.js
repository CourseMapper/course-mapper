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
angular.module('MyProgress', ['chart.js'])
.controller("BarProgressController", ['$scope', '$timeout', function ($scope, $timeout) {
	$scope.title = "My Course Progress History Chart";
	$scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September"];

	$scope.myPDFReadData = [[12, 19, 6, 10, 12, 14, 12, 2, 5]];
	$scope.myVideoWatchedData = [[2, 5, 8, 10, 12, 11, 14, 17, 22]];
	$scope.myCommentsMadeData = [[7, 5, 1, 5, 5, 9, 12, 13, 20]];
	$scope.myLikesData = [[4, 15, 12, 1, 17, 8, 15, 8, 2]];
	$scope.myFollowingCoursesData = [[0, 2, 0, 0, 1, 3, 1, 0, 2]];
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




