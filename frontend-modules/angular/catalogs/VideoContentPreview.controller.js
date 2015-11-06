app.controller('VideoContentPreviewController', function($scope) {
    $scope.API = null;

    $scope.onPlayerReady = function (API) {
        $scope.API = API;
    };

    $scope.$watch('isPlaying', function(newVal, oldVal){
        if(!$scope.isPlaying && $scope.API){
            $scope.API.pause();
        }
    });

});