app.controller('AdminFeedbackController', function($scope, $http, toastr, $window, $location, ActionBarService, Upload) {
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

    var fetchSolution = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/solutions/' + vId;
        $http.get(url).then( function(response) {
            if(response.data.solution) {
                var solution = response.data.solution;
                if(solution.solutionDocuments && solution.solutionDocuments.length>0) {
                    solution.displayDocumentsList = [];
                    _.each(solution.solutionDocuments, function(docName) {
                        var temp = {};
                        temp.link = window.location.origin + docName;
                        var tempArr = docName.split('/');
                        temp.name = tempArr[tempArr.length-1];
                        solution.displayDocumentsList.push(temp);
                    })
                }
                $scope.solution = solution;
                console.log('Solution', solution)
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        })
    }

    var reviews;
    var fetchPeerReviews = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/reviews?rName=AFCFetchPeerReviews&solutionId=' + vId + '&isAdminReview=false&isSubmitted=true';
        $http.get(url).then( function(response) {
            console.log('Students', response)
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
                    if (_.indexOf(oldReviewsID, review._id) == -1 || review.isSecondLoop) {
                        return review
                    }
                })
                //$scope.reviews = response.data.reviews
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        })
    }

    var fetchAdminReview = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/reviews?rName=AFCFetchPeerReviews&solutionId=' + vId + '&isAdminReview=true';
        $http.get(url).then( function(response) {
            console.log('Admin', response)
            $scope.existingReview = false
            if(response.data.reviews && response.data.reviews.length) {
                var review = response.data.reviews[0]
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
                $scope.existingReview = true
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        })
    }

    fetchSolution()
    fetchPeerReviews()
    fetchAdminReview()

    $scope.reviewDocuments = false;
    $scope.deleteUploadedFiles = function(fileName) {
        for(var i=0; i<$scope.review.displayDocumentsList.length; i++) {
            if ($scope.review.displayDocumentsList[i].link == fileName) {
                if(!$scope.review.deletedUploadedFiles) {
                    $scope.review.deletedUploadedFiles = [];
                }
                $scope.review.deletedUploadedFiles.push($scope.review.documents[i]);
                $scope.review.documents.splice(i,1);
                $scope.review.displayDocumentsList.splice(i,1);
                break;
            }
        }
    }

    $scope.deleteSelectedFiles = function(fileName) {
        console.log('Review Docs Selected', $scope.reviewDocuments, fileName);
        for(var i=0; i<$scope.reviewDocuments.length; i++) {
            if($scope.reviewDocuments[i].name == fileName) {
                $scope.reviewDocuments.splice(i,1);
                break;
            }
        }
    }

    $scope.isFormValid = function() {
        if ($scope.form.$error.min && $scope.form.$error.min.length) {
            return false
        } else if ($scope.form.$error.number && $scope.form.$error.number.length) {
            return false
        } else if ($scope.form.$error.required && $scope.form.$error.required.length) {
            return false
        } else if ($scope.form.$error.max && $scope.form.$error.max.length) {
            return false
        }
        return true
    }

    $scope.submitReview = function() {
        console.log($scope.review)
        $scope.isLoading = true;
        var uploadParams;
        if($scope.existingReview) {
             uploadParams = {
                method: 'PUT',
                url: '/api/peerassessment/' + $scope.course._id + '/reviews/' + $scope.review._id,
                fields: $scope.review
            };
        } else {
            console.log(_.extend($scope.review, {solutionId: $scope.solution._id}))
            uploadParams = {
                method: 'POST',
                url: '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + $scope.solution.peerReviewId._id +'/reviews/add',
                fields: _.extend($scope.review, {solutionId: $scope.solution._id})
            };
        }
        uploadParams.file = [];
        if($scope.reviewDocuments) {
            uploadParams.file.push({'reviewDocuments':$scope.reviewDocuments});
        }

        $scope.upload = Upload.upload(
            uploadParams
            )
            .progress(function (evt) {
                if (!evt.config.file)
                    return;

                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                // console.log("Progress", $scope.progress);
            })
            .success(function (data) {
                $scope.progress = 0;
                if (data.result) {
                    toastr.success('Successfully Saved');
                } else {
                    toastr.error(data.errors[0] || 'Failed');
                }
                $scope.isLoading = false;
                window.location.reload();
            })
            .error(function (data) {
                toastr.error('Internal Server Error');
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }

    $scope.openReview = function(review) {
        populateRubrics(review)
        populateDisplayDocumentList(review)
        $scope.peerReview = review

        if(review.isSecondLoop && review.oldReviewId) {
            reviews.every(function(r) {
                if(review.oldReviewId == r._id) {
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