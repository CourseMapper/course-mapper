app.controller('ReviewAssignmentTypeController', function($scope) {
    console.log('Debug: ReviewAssignmentController')
    // Setup default values for the view to be populated correctly
    if($scope.newAssignObj && $scope.newAssignObj.reviewSettings && !$scope.newAssignObj.reviewSettings.reviewAssignment) {
        $scope.newAssignObj.reviewSettings.reviewAssignment = 'single'
    }

    $scope.tooltip = "States if the solution will be reviewed by 1 or multiple"
})