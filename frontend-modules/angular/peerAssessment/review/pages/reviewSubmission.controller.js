app.controller('ReviewSubmissionController', function($scope, $http, toastr, $window, $location, ActionBarService, Upload) {
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
        //{
        //    clickAction: $scope.viewReviewsList,
        //    title: '<i class="ionicons ion-arrow-return-left"></i> &nbsp; BACK',
        //    aTitle: 'Back'
        //}
    );

    var requestData = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/reviews/'+ vId;
        $http.get(url).then( function(response) {
            var review = response.data.review;
            if(review.solutionId.solutionDocuments && review.solutionId.solutionDocuments.length) {
                var solutionDocumentsList = [];
                _.each(review.solutionId.solutionDocuments, function(docName) {
                    var temp = {};
                    temp.link = window.location.origin + docName;
                    var tempArr = docName.split('/');
                    temp.name = tempArr[tempArr.length-1];
                    solutionDocumentsList.push(temp);
                })
                $scope.solutionDocumentsList = solutionDocumentsList
            }
            if(review.peerReviewId.reviewSettings.rubrics && review.peerReviewId.reviewSettings.rubrics.length) {
                $scope.rubrics = review.peerReviewId.reviewSettings.rubrics
            }
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
            console.log('Review', $scope.review);
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });
    }
    requestData()

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
        var uploadParams = {
            method: 'PUT',
            url: '/api/peerassessment/' + $scope.course._id + '/reviews/' + $scope.review._id,
            fields: $scope.review
        };
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
                if(data.reviewId == vId) {
                    window.location.reload();
                } else {
                    window.history.replaceState({},"", '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=reviewSubmission&vId=' + data.reviewId)
                    //window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=reviewSubmission&vId=' + data.reviewId;
                    window.location.reload();
                }
            })
            .error(function (data) {
                toastr.error('Internal Server Error');
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }
})