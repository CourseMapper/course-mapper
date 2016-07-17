app.controller('ReviewController', function($scope, $http, ActionBarService, toastr) {
    if($scope.vName) {
        ActionBarService.extraActionsMenu = [];
        ActionBarService.extraActionsMenu.push(
            {
                clickAction: $scope.goBack,
                title: '<i class="ionicons ion-arrow-return-left"></i> &nbsp; BACK',
                aTitle: 'Back'
            },
            {
                separator: true
            },
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
            var oldReviewsID = [];
            console.log('Reviews', response.data.reviews);
            _.each(response.data.reviews, function(review) {
                // handling removal of old reviews if there is a second loop review
                if(review.oldReviewId) {
                    oldReviewsID.push(review.oldReviewId)
                }
            });
            $scope.reviews = _.filter(response.data.reviews, function(review) {
                if (_.indexOf(oldReviewsID, review._id) == -1 || review.isSecondLoop) {
                    return review
                }
            })
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