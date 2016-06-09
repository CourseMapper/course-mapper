app.controller('ReviewController', function($scope, $http, ActionBarService, toastr) {
    if($scope.vName) {
        ActionBarService.extraActionsMenu = [];
        ActionBarService.extraActionsMenu.push(
            {
                clickAction: $scope.redirectPRHome,
                title: '<i class="ionicons ion-home"></i> &nbsp; PEER REVIEWS HOME',
                aTitle: 'Peer Review Home'
            }
        );
    }

    var requestData = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/reviews?rName=RCRequestData';
        $http.get(url).then( function(response) {
            _.each(response.data.reviews, function(solution) {
                // do something if needed
            });
            $scope.reviews = response.data.reviews;
            console.log('Reviews', $scope.reviews);
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });
    }

    requestData();

    $scope.openReview = function(review, event) {
        if(event) {
            event.stopPropagation();
        }
        console.log('Opening Review: ', review);
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=reviewSubmission&vId=' + review._id;
    }
})