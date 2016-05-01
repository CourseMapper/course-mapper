app.controller('NewPeerReviewController', function($scope, $http, toastr, $window, Upload, ActionBarService) {
    console.log('Debug: NewPeerReviewController')
    ActionBarService.extraActionsMenu = [];

    ActionBarService.extraActionsMenu.push(
        {
            clickAction: $scope.redirectPRHome,
            title: '<i class="ionicons ion-home"></i> &nbsp; PEER REVIEWS HOME',
            aTitle: 'Peer Review Home'
        }
    );

    $scope.newAssignObj = {
        title: "",
        reviewDescription: "",
        groupSubmission: false,
        totalMarks: 0,
        //publicationDate: null,
        dueDate: null,
        ssPublicationDate: null,
        reviewSettings: {}
    }
    $scope.reviewDocuments = false;
    $scope.sampleSolutions = false;
    $scope.progress = 0;

    $scope.deleteSelectedFiles = function(fileName) {
        console.log('Review Docs Selected', $scope.reviewDocuments, fileName);
        for(var i=0; i<$scope.reviewDocuments.length; i++) {
            if($scope.reviewDocuments[i].name == fileName) {
                $scope.reviewDocuments.splice(i,1);
                break;
            }
        }
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