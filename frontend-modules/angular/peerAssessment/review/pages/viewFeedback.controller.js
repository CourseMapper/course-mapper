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

    var fetchReviews = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/reviews?rName=VFCFetchReviews&peerReviewId=' + vId;
        $http.get(url).then( function(response) {
            console.log('All Reviews', response)
            if(response.data.reviews) {
                var reviews = response.data.reviews
                $scope.reviews = _.filter(reviews, function(review) {
                    return !review.isAdminReview
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
        console.log(review);
        $('#viewReviewModal').modal('show');
    }
})