app.controller('ReviewAssignmentController', function($scope) {
    console.log('Debug: ReviewAssignmentController')
    // Setup default values for the view to be populated correctly
    if($scope.newAssignObj) {
        $scope.newAssignObj.reviewSettings.reviewAssignment = 'single'
    }
})