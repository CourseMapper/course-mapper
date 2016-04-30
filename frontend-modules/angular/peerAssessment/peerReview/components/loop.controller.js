app.controller('LoopController', function($scope) {
    console.log('Debug: LoopController')
    // Setup default values for the view to be populated correctly
    $scope.multipleView = false
    if($scope.newAssignObj) {
        $scope.newAssignObj.reviewSettings.loop = 'single'
    }
    $scope.toggleView = function(val) {
        console.log('Checking object', $scope.newAssignObj)
        if(val == 'multiple') {
            $scope.multipleView = true
        } else {
            $scope.multipleView = false
        }
    }
})