app.controller('ViewFeedbackController', function($scope, $http, toastr, $window, $location, ActionBarService, Upload) {
    vId = $location.search().vId;
    if(!vId) {
        return
    }

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
                    calculateMarks(review, $scope.reviews)
                    $scope.review = review
                }
                console.log('AdminReview', $scope.review)
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        })
    }

    var calculateMarks = function(adminReview, peerreviews) {
        studentReviewPercentage = adminReview.peerReviewId.reviewSettings.studentPercentage;
        var totalMarks = 0
        _.each(peerreviews, function(review) {
            totalMarks = totalMarks + review.marksObtained
        })
        var average = totalMarks/peerreviews.length
        var studentMarks = average * studentReviewPercentage/100
        var adminMarks = adminReview.marksObtained * ((100-studentReviewPercentage)/100)
        var finalMarks = adminMarks + studentMarks
        console.log(finalMarks)
        adminReview.marksObtained = finalMarks
    }

    fetchReviews()

    $scope.openReview = function(review) {
        populateRubrics(review)
        populateDisplayDocumentList(review)
        $scope.peerReview = review

        if(review.isSecondLoop && review.oldReviewId) {
            console.log('All reviews', reviews)
            reviews.every(function(r) {
                console.log(review.oldReviewId, r._id)
                if(review.oldReviewId == r._id) {
                    console.log('Old review matched', r)
                    populateRubrics(r)
                    populateDisplayDocumentList(r)
                    $scope.firstReview = r
                    return false
                }
                return true
            })
        }
        console.log(review);
        $('#viewReviewModal').modal('show');
    }

    populateRubrics = function(review) {
        if(review.peerReviewId.reviewSettings.rubrics && review.peerReviewId.reviewSettings.rubrics.length) {
            review.rubrics = review.peerReviewId.reviewSettings.rubrics
        }
    }

    populateDisplayDocumentList = function(review) {
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
    }
})