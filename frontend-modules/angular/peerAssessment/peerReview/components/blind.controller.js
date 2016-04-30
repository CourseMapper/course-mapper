app.controller('BlindController', function($scope) {
    console.log('Debug: BlindController')
    // Setup default values for the view to be populated correctly
    if($scope.newAssignObj) {
        $scope.newAssignObj.reviewSettings.blind = 'double'
    }
})