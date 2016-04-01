angular.module('TopContributor', [''])
    .controller('TopContributorController', function($scope, $http, $location) {
        $scope.HeaderTitle = "Top Contributor";

        var loc = $location.path();
        var parseLoc = loc.replace ('/cid/', '');
        //alert(parseLoc);
        if (parseLoc) {

            $http.get('/api/course-analytics/top-contributor/user-list/' + parseLoc).success(function (data) {
                $scope.topContributor = data.topContributor;

            });


        } else
            console.log('cannot get courseId in analytic widget');

    });