app.controller('LoopController', function($scope) {
    console.log('Debug: LoopController')
    // Setup default values for the view to be populated correctly
    $scope.$watch(function(){
        return $scope.newAssignObj;
    }, function(newAssignObj) {
        if(newAssignObj && newAssignObj.reviewSettings && $scope.newAssignObj.reviewSettings.loop == 'multiple'){
            $scope.multipleView = true
        } else {
            $scope.multipleView = false
        }
    })

    if($scope.newAssignObj && $scope.newAssignObj.reviewSettings && !$scope.newAssignObj.reviewSettings.loop) {
        $scope.newAssignObj.reviewSettings.loop = 'single'
        $scope.multipleView = false
    } else if($scope.newAssignObj) {
        if($scope.newAssignObj.reviewSettings.loop == 'single'){
            $scope.multipleView = false
        } else {
            $scope.multipleView = true;
        }
    }
    $scope.toggleView = function(val) {
        console.log('Checking object', $scope.newAssignObj)
        if(val == 'multiple') {
            $scope.multipleView = true
        } else {
            $scope.multipleView = false
        }
    }

    $scope.tooltip = "States the number of time the review process will happen"
})