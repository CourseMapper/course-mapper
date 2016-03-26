app.controller('PeerAssessmentController', function($scope, $http, courseService, toastr, $window, Upload) {
    $scope.course = null;
    $scope.peerreviews = null;

    $scope.tabOpened = function() {
        if (courseService.course) {
            $scope.course = courseService.course;

            $scope.initTab(courseService.course._id);
        } else {
            $scope.$on('onAfterInitCourse', function (e, course) {
                $scope.course = course;
                $scope.initTab(course._id);
            });
        }
    }

    $scope.initTab = function (courseId) {

        var url = '/api/peerassessment/' + courseId + '/peerreviews';
        $http.get(url).then( function(response) {
            _.each(response.data.peerreviews, function(review) {
                review.publicationDate = new Date(review.publicationDate);
                review.dueDate = new Date(review.dueDate);
                review.solutionPublicationDate = new Date(review.solutionPublicationDate);
            });
            $scope.peerreviews = response.data.peerreviews;
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });
    }

    $scope.deletePeerReview = function(reviewId) {
        var url = '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + reviewId;

        $http.delete(url).then( function(response) {
            for( var i=0; i<$scope.peerreviews.length; i++) {
                if($scope.peerreviews[i]._id == reviewId) {
                    break;
                }
            }
            $scope.peerreviews.splice(i,1);
        }, function(err) {
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });

        $('#confirmDeleteAssignmentModal').modal('hide');
    }

    $scope.openDeleteConfirmationModal = function(reviewDocId) {
        $scope.deleteReviewId = reviewDocId;
        $('#confirmDeleteAssignmentModal').modal('show');
    }

    $scope.tabOpened();
});

app.controller('NewPeerReviewController', function($scope, $http, toastr, $window, Upload){
    $scope.newAssignObj = {
        title: "",
        reviewDescription: "",
        groupSubmission: false,
        totalMarks: 0,
        //publicationDate: null,
        dueDate: null,
        ssPublicationDate: null
    }
    $scope.reviewDocuments = false;
    $scope.sampleSolutions = false;
    $scope.progress = 0;

    $scope.createPeerReview = function() {
        $scope.isLoading = true;
        var uploadParams = {
            url: '/api/peerassessment/' + $scope.$parent.course._id + '/peerreviews',
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
                    toastr.error('Error Creating Peer Review');
                }
                $scope.isLoading = false;
                 $('#addNewAssignmentModal').modal('hide');

                 window.location.reload();
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }

    $scope.processAssignmentCredentials = function() {
        // Check if this is needed when dealing with validation stuff
    }
});