app.controller('NewPeerReviewController', function($scope, $http, toastr, $window, Upload, ActionBarService) {
    console.log('Debug: NewPeerReviewController')
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

    $scope.newAssignObj = {
        title: "",
        reviewDescription: "",
        groupSubmission: false,
        totalMarks: 0,
        publicationDate: null,
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

    $scope.dateValidationObject = {
        publicationDate : { valid: true, message: '' },
        dueDate : { valid: true, message: '' },
        solutionDate : { valid: true, message: '' },
        reviewStartDate : { valid: true, message: '' },
        reviewEndDate : { valid: true, message: '' },
        secondDueDate : { valid: true, message: '' },
        secondReviewStartDate : { valid: true, message: '' },
        secondReviewEndDate : { valid: true, message: '' },
    }

    var clearValidation = function() {
        $scope.dateValidationObject.publicationDate.valid = true
        $scope.dateValidationObject.dueDate.valid = true
        $scope.dateValidationObject.solutionDate.valid = true
        $scope.dateValidationObject.reviewStartDate.valid = true
        $scope.dateValidationObject.reviewEndDate.valid = true
        $scope.dateValidationObject.secondDueDate.valid = true
        $scope.dateValidationObject.secondReviewStartDate.valid = true
        $scope.dateValidationObject.secondReviewEndDate.valid = true
    }

    $scope.formValidation = function() {
        clearValidation()
        if($scope.newAssignObj.dueDate) {
            if(!$scope.newAssignObj.publicationDate) {
                $scope.dateValidationObject.publicationDate.valid = false;
                $scope.dateValidationObject.publicationDate.message = 'Publication date is required for due date';
            } else if ($scope.newAssignObj.publicationDate >= $scope.newAssignObj.dueDate) {
                $scope.dateValidationObject.dueDate.valid = false;
                $scope.dateValidationObject.dueDate.message = 'Due date should be greater than publication date';
            }
        }
        if($scope.newAssignObj.ssPublicationDate) {
            if(!$scope.newAssignObj.dueDate) {
                $scope.dateValidationObject.dueDate.valid = false;
                $scope.dateValidationObject.dueDate.message = 'Due date is required for solution publication date';
            } else if ($scope.newAssignObj.dueDate >= $scope.newAssignObj.ssPublicationDate) {
                $scope.dateValidationObject.solutionDate.valid = false;
                $scope.dateValidationObject.solutionDate.message = 'Solution publication date should be greater than due date';
            }
        }

        if($scope.newAssignObj.reviewSettings.reviewStartDate) {
            if(!$scope.newAssignObj.dueDate) {
                $scope.dateValidationObject.dueDate.valid = false;
                $scope.dateValidationObject.dueDate.message = 'Due date is required for review process';
            } else if ($scope.newAssignObj.dueDate >= $scope.newAssignObj.reviewSettings.reviewStartDate) {
                $scope.dateValidationObject.reviewStartDate.valid = false;
                $scope.dateValidationObject.reviewStartDate.message = 'Review start date should be greater than than due date';
            }
        }

        if($scope.newAssignObj.reviewSettings.reviewEndDate) {
            if(!$scope.newAssignObj.reviewSettings.reviewStartDate) {
                $scope.dateValidationObject.reviewStartDate.valid = false;
                $scope.dateValidationObject.reviewStartDate.message = 'Review start date is required';
            } else if ($scope.newAssignObj.reviewSettings.reviewStartDate >= $scope.newAssignObj.reviewSettings.reviewEndDate) {
                $scope.dateValidationObject.reviewEndDate.valid = false;
                $scope.dateValidationObject.reviewEndDate.message = 'Review end date should be greater than review start date';
            }
        }
        if($scope.newAssignObj.reviewSettings.loop == 'multiple') {
            if($scope.newAssignObj.reviewSettings.secondDueDate) {
                if(!$scope.newAssignObj.reviewSettings.reviewEndDate) {
                    $scope.dateValidationObject.reviewEndDate.valid = false;
                    $scope.dateValidationObject.reviewEndDate.message = 'Review end date is required';
                } else if ($scope.newAssignObj.reviewSettings.reviewEndDate >= $scope.newAssignObj.reviewSettings.secondDueDate) {
                    $scope.dateValidationObject.secondDueDate.valid = false;
                    $scope.dateValidationObject.secondDueDate.message = 'Second due date should be greater than review end date';
                }
            }

            if($scope.newAssignObj.reviewSettings.secondReviewStartDate) {
                if(!$scope.newAssignObj.reviewSettings.secondDueDate) {
                    $scope.dateValidationObject.secondDueDate.valid = false;
                    $scope.dateValidationObject.secondDueDate.message = 'Second due date is required';
                } else if ($scope.newAssignObj.reviewSettings.secondDueDate >= $scope.newAssignObj.reviewSettings.secondReviewStartDate) {
                    $scope.dateValidationObject.secondReviewStartDate.valid = false;
                    $scope.dateValidationObject.secondReviewStartDate.message = 'Second review start date should be greater than second due date';
                }
            }

            if($scope.newAssignObj.reviewSettings.secondReviewEndDate) {
                if(!$scope.newAssignObj.reviewSettings.secondReviewStartDate) {
                    $scope.dateValidationObject.secondReviewStartDate.valid = false;
                    $scope.dateValidationObject.secondReviewStartDate.message = 'Second review start date is required';
                } else if ($scope.newAssignObj.reviewSettings.secondReviewStartDate >= $scope.newAssignObj.reviewSettings.secondReviewEndDate) {
                    $scope.dateValidationObject.secondReviewEndDate.valid = false;
                    $scope.dateValidationObject.secondReviewEndDate.message = 'Second review end date should be greater than second review start date';
                }
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
        } else {
            for (var key in $scope.dateValidationObject) {
                if ($scope.dateValidationObject[key].valid == false) {
                    return false
                }
            }
        }
        return true
    }

    $scope.createPeerReview = function() {
        console.log('Form object', $scope.form)
        console.log('Date validation object', $scope.dateValidationObject)
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

                window.history.back();
            })
            .error(function (data) {
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }
});