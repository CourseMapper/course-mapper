app.controller('BlindController', function($scope) {
    console.log('Debug: BlindController')
    // Setup default values for the view to be populated correctly
    if($scope.newAssignObj && $scope.newAssignObj.reviewSettings && !$scope.newAssignObj.reviewSettings.blind) {
        $scope.newAssignObj.reviewSettings.blind = 'double'
    }

    //$scope.toottip = "<b>Single: </b> The reviewer knows the student identity <br/>" +
    //                 "<b>Double: </b> Both reviewer and student identity is confidential <br/>" +
    //                 "<b>None: </b> Both reviewer and student knows each other's identity <br/>"

    $scope.tooltip = "States who can see the identity during the process"
})