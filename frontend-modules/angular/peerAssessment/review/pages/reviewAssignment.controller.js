app.controller('ReviewAssignmentController', function($scope, $http, toastr, $window, $location, ActionBarService) {
    console.log('Debug: ReviewAssignmentController')
    vId = $location.search().vId;
    if(!vId) {
        return
    }
    ActionBarService.extraActionsMenu = [];

    ActionBarService.extraActionsMenu.push(
        {
            clickAction: $scope.viewPeerReview,
            clickParams: vId,
            title: '<i class="ionicons ion-arrow-return-left"></i> &nbsp; BACK',
            aTitle: 'Back'
        }
    );
})