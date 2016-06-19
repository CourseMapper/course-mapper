app.controller('ViewFeedbackController', function($scope, $http, toastr, $window, $location, ActionBarService, Upload) {
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

    var reviews
    var fetchReviews = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/reviews?rName=VFCFetchReviews&peerReviewId=' + vId;
        $http.get(url).then( function(response) {
            console.log('All Reviews', response)
            if(response.data.reviews) {
                reviews = response.data.reviews
                var oldReviewsID = []
                _.each(reviews, function(review) {
                    // handling removal of old reviews if there is a second loop review
                    if(review.oldReviewId) {
                        oldReviewsID.push(review.oldReviewId)
                    }
                });
                $scope.reviews = _.filter(reviews, function(review) {
                    if ((_.indexOf(oldReviewsID, review._id) == -1 || review.isSecondLoop) && !review.isAdminReview) {
                        return review
                    }
                    //return !review.isAdminReview
                })
                var adminReview = _.reject(reviews, function(review) {
                    return !review.isAdminReview
                })
                if(adminReview.length) {
                    var review = adminReview[0]
                    if (review.documents && review.documents.length > 0) {
                        review.displayDocumentsList = [];
                        _.each(review.documents, function (docName) {
                            console.log(docName)
                            var temp = {};
                            temp.link = window.location.origin + docName;
                            var tempArr = docName.split('/');
                            temp.name = tempArr[tempArr.length - 1];
                            review.displayDocumentsList.push(temp);
                        })
                    }
                    $scope.review = review
                }
                console.log('AdminReview', $scope.review)
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        })
    }

    fetchReviews()

    $scope.openReview = function(review) {
        if(review.documents && review.documents.length>0) {
            review.displayDocumentsList = [];
            _.each(review.documents, function(docName) {
                var temp = {};
                temp.link = window.location.origin + docName;
                var tempArr = docName.split('/');
                temp.name = tempArr[tempArr.length-1];
                review.displayDocumentsList.push(temp);
            })
        }
        $scope.peerReview = review

        if(review.isSecondLoop && review.oldReviewId) {
            reviews.every(function(r) {
                if(review.oldReviewId == r._id) {
                    $scope.firstReview = r
                    return
                }
            })
        }
        console.log(review);
        $('#viewReviewModal').modal('show');
    }
})