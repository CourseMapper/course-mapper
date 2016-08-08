app.controller('ReviewPercentageController', function($scope) {
    console.log('Debug: ReviewPercentageController')
    // Setup default values for the view to be populated correctly
    if($scope.newAssignObj && $scope.newAssignObj.reviewSettings && !$scope.newAssignObj.reviewSettings.studentPercentage) {
        $scope.newAssignObj.reviewSettings.studentPercentage = 0
    }
})