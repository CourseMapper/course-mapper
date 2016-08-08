app.controller('ViewPeerReviewController', function($scope, $location, $http, toastr, ActionBarService) {
    console.log('Debug: ViewPeerReviewController')
    $scope.vId = $location.search().vId;
    if($scope.vName && $scope.vId) {
        $scope.viewReview = null;
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

        ActionBarService.extraActionsMenu.push({
            separator: true
        });

        var url = '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + $scope.vId;
        $http.get(url).then( function(response) {
            var review = response.data.peerReview;
            review.publicationDate = new Date(review.publicationDate);
            review.dueDate = new Date(review.dueDate);
            review.solutionPublicationDate = new Date(review.solutionPublicationDate);
            review.ssPublicationDate = review.solutionPublicationDate;
            delete review.solutionPublicationDate;
            review.reviewDescription = review.description;
            delete review.description;

            if(review.reviewSettings.reviewStartDate) {
                review.reviewSettings.reviewStartDate = new Date(review.reviewSettings.reviewStartDate)
            }
            if(review.reviewSettings.reviewEndDate) {
                review.reviewSettings.reviewEndDate = new Date(review.reviewSettings.reviewEndDate)
            }
            if(review.reviewSettings.secondDueDate) {
                review.reviewSettings.secondDueDate = new Date(review.reviewSettings.secondDueDate)
            }
            if(review.reviewSettings.secondReviewStartDate) {
                review.reviewSettings.secondReviewStartDate = new Date(review.reviewSettings.secondReviewStartDate)
            }
            if(review.reviewSettings.secondReviewEndDate) {
                review.reviewSettings.secondReviewEndDate = new Date(review.reviewSettings.secondReviewEndDate)
            }

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

            if(review.solutions && review.solutions.length>0) {
                review.displaySolutionsList = [];
                _.each(review.solutions, function(docName) {
                    var temp = {};
                    temp.link = window.location.origin + docName;
                    var tempArr = docName.split('/');
                    temp.name = tempArr[tempArr.length-1];
                    review.displaySolutionsList.push(temp);
                })
            }

            $scope.viewReview = review;
            console.log('ViewPeerReview: ', review)
            if($scope.isAdmin || $scope.isManager || $scope.isOwner) {
                ActionBarService.extraActionsMenu.push(
                    {
                        clickAction: $scope.editPeerReview,
                        clickParams: $scope.viewReview,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-edit"></i> &nbsp; EDIT',
                        aTitle: 'Edit Peer Review'
                    },
                    {
                        clickAction: $scope.openDeleteConfirmationModal,
                        clickParams: $scope.viewReview._id,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-ios-trash"></i> &nbsp; DELETE',
                        aTitle: 'Delete Peer Review'
                    },
                    {
                        separator: true
                    },
                    {
                        clickAction: $scope.reviewAssignment,
                        clickParams: $scope.viewReview._id,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-android-done-all"></i> &nbsp; ASSIGN REVIEWS',
                        aTitle: 'Assign Reviews'
                    }
                );
            }

            if($scope.isEnrolled) {
                ActionBarService.extraActionsMenu.push(
                    {
                        clickAction: $scope.openAddEditSolutionModal,
                        clickParams: $scope.viewReview,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-ios-paper"></i> &nbsp; ADD/EDIT SOLUTION',
                        aTitle: 'Add/Edit Solution'
                    },
                    {
                        separator: true
                    },
                    {
                        clickAction: function() { window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewFeedback&vId=' + $scope.viewReview._id; },
                        title: '&nbsp;&nbsp; <i class="ionicons ion-checkmark-circled"></i> &nbsp; VIEW FEEDBACK',
                        aTitle: 'View Feedback'
                    }
                );
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });
    }
})