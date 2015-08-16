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
angular.module('MyCourseApp', []).
    controller('BeController', function($scope, $http) {
        $http.get('/api/categories').success(function (data) {
            $scope.categories = data.categories;
        });
    });
