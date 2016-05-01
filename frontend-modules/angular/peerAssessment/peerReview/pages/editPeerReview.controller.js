app.controller('EditPeerReviewController', function($scope, $http, toastr, $window, Upload, ActionBarService, $location) {
    console.log('Debug: EditPeerReviewController')
    ActionBarService.extraActionsMenu = [];

    ActionBarService.extraActionsMenu.push(
        {
            clickAction: $scope.redirectPRHome,
            title: '<i class="ionicons ion-home"></i> &nbsp; PEER REVIEWS HOME',
            aTitle: 'Peer Review Home'
        }
    );

    $scope.reviewDocuments = false;
    $scope.sampleSolutions = false;
    $scope.progress = 0;
    //$scope.newAssignObj.deletedUploadedFiles = [];
    //$scope.newAssignObj.deletedUploadedSolutions = [];

    $scope.deleteUploadedFiles = function(fileName) {
        for(var i=0; i<$scope.newAssignObj.displayDocumentsList.length; i++) {
            if ($scope.newAssignObj.displayDocumentsList[i].link == fileName) {
                if(!$scope.newAssignObj.deletedUploadedFiles) {
                    $scope.newAssignObj.deletedUploadedFiles = [];
                }
                $scope.newAssignObj.deletedUploadedFiles.push($scope.newAssignObj.documents[i]);
                $scope.newAssignObj.documents.splice(i,1);
                $scope.newAssignObj.displayDocumentsList.splice(i,1);
                break;
            }
        }
        console.log('Check deleted Objects', $scope.newAssignObj.deletedUploadedFiles, $scope.newAssignObj.documents, $scope.newAssignObj.displayDocumentsList);
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

    $scope.deleteUploadedSolutions = function(fileName) {
        for(var i=0; i<$scope.newAssignObj.displaySolutionsList.length; i++) {
            if ($scope.newAssignObj.displaySolutionsList[i].link == fileName) {
                if(!$scope.newAssignObj.deletedUploadedSolutions) {
                    $scope.newAssignObj.deletedUploadedSolutions = [];
                }
                $scope.newAssignObj.deletedUploadedSolutions.push($scope.newAssignObj.solutions[i]);
                $scope.newAssignObj.solutions.splice(i,1);
                $scope.newAssignObj.displaySolutionsList.splice(i,1);
                break;
            }
        }
        console.log('Check deleted Objects', $scope.newAssignObj.deletedUploadedSolutions, $scope.newAssignObj.solutions, $scope.newAssignObj.displaySolutionsList);
    }

    $scope.deleteSelectedSolutions = function(fileName) {
        console.log('Review Docs Selected', $scope.sampleSolutions, fileName);
        for(var i=0; i<$scope.sampleSolutions.length; i++) {
            if($scope.sampleSolutions[i].name == fileName) {
                $scope.sampleSolutions.splice(i,1);
                break;
            }
        }
    }

    $scope.initiateController = function() {
        var vId = $location.search().vId;
        if($scope.vName && vId) {
            $scope.newAssignObj = null;

            var url = '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + vId;
            $http.get(url).then(function (response) {
                console.log('Resp', response);
                var review = response.data.peerReview;
                review.publicationDate = new Date(review.publicationDate);
                review.dueDate = new Date(review.dueDate);
                review.solutionPublicationDate = new Date(review.solutionPublicationDate);
                review.ssPublicationDate = review.solutionPublicationDate;
                delete review.solutionPublicationDate;
                review.reviewDescription = review.description;
                delete review.description;

                if (review.documents && review.documents.length > 0) {
                    review.displayDocumentsList = [];
                    _.each(review.documents, function (docName) {
                        var temp = {};
                        temp.link = window.location.origin + docName;
                        var tempArr = docName.split('/');
                        temp.name = tempArr[tempArr.length - 1];
                        review.displayDocumentsList.push(temp);
                    })
                }

                if (review.solutions && review.solutions.length > 0) {
                    review.displaySolutionsList = [];
                    _.each(review.solutions, function (docName) {
                        var temp = {};
                        temp.link = window.location.origin + docName;
                        var tempArr = docName.split('/');
                        temp.name = tempArr[tempArr.length - 1];
                        review.displaySolutionsList.push(temp);
                    })
                }

                if (review.groupSubmission) {
                    review.groupSubmission = 'Yes';
                } else {
                    review.groupSubmission = 'No';
                }

                // Processing review settings
                if (review.reviewSettings && review.reviewSettings.reviewStartDate) {
                    review.reviewSettings.reviewStartDate = new Date(review.reviewSettings.reviewStartDate)
                }
                if (review.reviewSettings && review.reviewSettings.reviewEndDate) {
                    review.reviewSettings.reviewEndDate = new Date(review.reviewSettings.reviewEndDate)
                }
                if (review.reviewSettings && review.reviewSettings.secondDueDate) {
                    review.reviewSettings.secondDueDate = new Date(review.reviewSettings.secondDueDate)
                }
                if (review.reviewSettings && review.reviewSettings.secondReviewStartDate) {
                    review.reviewSettings.secondReviewStartDate = new Date(review.reviewSettings.secondReviewStartDate)
                }
                if (review.reviewSettings && review.reviewSettings.secondReviewEndDate) {
                    review.reviewSettings.secondReviewEndDate = new Date(review.reviewSettings.secondReviewEndDate)
                }

                $scope.newAssignObj = review;

            }, function (err) {
                // Check for proper error message later
                toastr.error('Internal Server Error. Please try again later.');
            });
        }
    }

    $scope.editPeerReview = function() {
        console.log('Debug', $scope.newAssignObj);
        $scope.isLoading = true;
        var uploadParams = {
            method: 'PUT',
            url: '/api/peerassessment/' + $scope.$parent.course._id + '/peerreviews/' + $scope.newAssignObj._id,
            fields: $scope.newAssignObj
        };
        uploadParams.file = [];
        if($scope.reviewDocuments) {
            uploadParams.file.push({'reviewDocuments':$scope.reviewDocuments});
        }
        if($scope.sampleSolutions) {
            uploadParams.file.push({'sampleSolutions':$scope.sampleSolutions});
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
                    toastr.error('Updating Peer Review Failed');
                }
                $scope.isLoading = false;
                $('#addNewAssignmentModal').modal('hide');

                window.location.reload();
            })
            .error(function (data) {
                toastr.error('Updating Peer Review Failed');
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }

    $scope.processAssignmentCredentials = function() {
        // Check if this is needed when dealing with validation stuff
    }

    $scope.initiateController();
});