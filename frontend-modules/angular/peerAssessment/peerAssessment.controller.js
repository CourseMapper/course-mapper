app.controller('PeerAssessmentController', function($scope, $http, courseService, toastr, $window, Upload, $location, ActionBarService) {
    $scope.course = null;
    $scope.peerreviews = null;
    $scope.vName = null;

    $scope.extraActionsMenu = [];

    $scope.$watch(function(){
            return ActionBarService.extraActionsMenu;
        },
        function (newValue) {
            $scope.extraActionsMenu = ActionBarService.extraActionsMenu;
        });

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
                // check if they are needed
                //review.solutionPublicationDate = new Date(review.solutionPublicationDate);
                //review.ssPublicationDate = review.solutionPublicationDate;
                //delete review.solutionPublicationDate;
                //review.reviewDescription = review.description;
                //delete review.description;
            });
            $scope.peerreviews = response.data.peerreviews;
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });

        $scope.initiateView();
    }

    // Reviews Assignment
    $scope.reviewAssignment = function(peerReviewId) {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=reviewAssignment&vId=' + peerReviewId;
    }

    // Peer Reviews
    $scope.openDeleteConfirmationModal = function(reviewDocId, event) {
        if(event) {
            event.stopPropagation();
        }
        $scope.deleteReviewId = reviewDocId;
        $('#confirmDeleteAssignmentModal').modal('show');
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
            if($scope.vName || $scope.vId) {
                $scope.redirectPRHome();
            }
        }, function(err) {
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });

        $('#confirmDeleteAssignmentModal').modal('hide');
    }

    $scope.goBack = function() {
        window.history.back();
    }

    $scope.editPeerReview = function(review, event) {
        if(event) {
            event.stopPropagation();
        }
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=editPeerReview&vId=' + review._id;
    }

    $scope.viewPeerReview = function(peerReviewId) {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewPeerReview&vId=' + peerReviewId;
    }

    $scope.newPeerReview = function() {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=newPeerReview';
    }

    // Solutions
    $scope.openAddEditSolutionModal = function(paramsObj) {
        console.log('review', paramsObj);
        var config = {};
        // Check if we are coming from solution List
        if(paramsObj.path == 'solutionList') {
            config.method = 'GET'
            config.url = '/api/peerassessment/' + $scope.course._id + '/solutions/' + paramsObj._id;
        } else {
            config.method = 'POST';
            config.url = '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + paramsObj._id + '/solutions';
            // Check whether this is needed ?
            config.params = {
                reviewTitle: paramsObj.title
            }
        }

        $http(config).then(function(response) {
            console.log('response', response);
            if (response.data.result) {
                $scope.solutionObj = response.data.solution;
                if (paramsObj.path !== 'solutionList') {
                    $scope.solutionObj.peerReviewTitle = response.data.title;
                }

                if ($scope.solutionObj && $scope.solutionObj.solutionDocuments && $scope.solutionObj.solutionDocuments.length > 0) {
                    $scope.solutionObj.displayDocumentsList = [];
                    _.each($scope.solutionObj.solutionDocuments, function (docName) {
                        var temp = {};
                        temp.link = window.location.origin + docName;
                        var tempArr = docName.split('/');
                        temp.name = tempArr[tempArr.length - 1];
                        $scope.solutionObj.displayDocumentsList.push(temp);
                    })
                }

                $('#addEditSolutionModal').modal('show');
            } else {
                toastr.warning('Deadline has been passed. Unable to upload the solution');
            }
        }, function(err) {
            console.log('err', err);
        })
    }

    $scope.giveFeedback = function(solutionId) {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=giveFeedback&vId=' + solutionId;
    }

    // Was used in adminfeeback which has now been changed so its not needed any more but still verify
    $scope.viewSolution = function(solutionId) {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewSolution&vId=' + solutionId;
    }

    $scope.viewAllSolutions = function() {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewSolutionsList';
    }

    $scope.viewReviewsList = function() {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewReviewsList';
    }

    $scope.openDeleteSolutionConfirmationModal = function(solutionId, event) {
        if(event) {
            event.stopPropagation();
        }
        $scope.deleteSolutionId = solutionId;
        $('#confirmDeleteSolutionModal').modal('show');
    }

    $scope.manageRubrics = function() {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=manageRubrics';
    }

    $scope.openRubric = function() {
        $('#addEditRubricModal').modal('show');
    }

    // Home
    $scope.redirectPRHome = function() {
        $scope.vName = false;
        $scope.vId = false;
        $location.search('vName', '');
        $location.search('vId', '');
        // window.location.reload();
    }

    $scope.$on('$routeUpdate', function () {
        $scope.initiateView();

        if (!$scope.vName) {
            $('li.peerAssessmentTitle').remove();
            $scope.tabOpened();
            //var te = $('a.discussionTabLink').text();
            //$('.action-header .breadcrumb li.tab').html(te);
        }
    });

    $scope.initiateView = function() {
        $scope.vName = $location.search().vName;
        if($scope.vName) {
            if($scope.vName == 'viewPeerReview') {
                $scope.currentView = 'viewAssignment.tpl';
                $scope.manageBreadCrumb('View Peer Review');
            } else if($scope.vName == 'viewSolutionsList') {
                $scope.currentView = 'seeAllSolutions.tpl';
                $scope.manageBreadCrumb('See All Solutions');
            } else if($scope.vName == 'viewSolution') {
                $scope.currentView = 'viewSolution.tpl';
                $scope.manageBreadCrumb('View Solution');
            } else if($scope.vName == 'newPeerReview') {
                $scope.currentView = 'addNewAssignment.tpl'
                $scope.manageBreadCrumb('New Peer Review');
            } else if($scope.vName == 'editPeerReview') {
                $scope.currentView = 'editAssignment.tpl'
                $scope.manageBreadCrumb('Edit Peer Review');
            } else if($scope.vName == 'reviewAssignment') {
                $scope.currentView = 'reviewAssignment.tpl'
                $scope.manageBreadCrumb('Assign Reviews');
            } else if($scope.vName == 'viewReviewsList') {
                $scope.currentView = 'reviewList.tpl'
                $scope.manageBreadCrumb('See All Reviews');
            } else if($scope.vName == 'manageRubrics') {
                $scope.currentView = 'manageRubrics.tpl'
                $scope.manageBreadCrumb('Manage Rubrics');
            } else if($scope.vName == 'reviewSubmission') {
                $scope.currentView = 'reviewSubmission.tpl'
                $scope.manageBreadCrumb('Submit Review');
            } else if($scope.vName == 'giveFeedback') {
                $scope.currentView = 'adminFeedback.tpl'
                $scope.manageBreadCrumb('Feedback')
            }  else if($scope.vName == 'viewFeedback') {
                $scope.currentView = 'viewFeedback.tpl'
                $scope.manageBreadCrumb('View Feedback')
            }
        } else {
            $scope.currentView = 'main.tpl';
            ActionBarService.extraActionsMenu = [];
            if($scope.isAdmin || $scope.isManager || $scope.isOwner) {
                ActionBarService.extraActionsMenu.push(
                    //{
                    //    'html': '<a style="cursor: pointer;"' +
                    //    ' data-toggle="modal" data-target="#addNewAssignmentModal"' +
                    //    ' title="New Peer Review">' +
                    //    '&nbsp;&nbsp; <i class="ionicons ion-android-add"></i> &nbsp; NEW PEER REVIEW</a>'
                    //},
                    {
                        clickAction: $scope.newPeerReview,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-android-add"></i> &nbsp; NEW PEER REVIEW',
                        aTitle: 'New Peer Review'
                    },
                    {
                        separator: true
                    },
                    {
                        clickAction: $scope.viewAllSolutions,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-ios-paper"></i> &nbsp; SEE ALL SOLUTIONS',
                        aTitle: 'See All Solutions'
                    }
                );
            }

            ActionBarService.extraActionsMenu.push(
                {
                    clickAction: $scope.viewReviewsList,
                    title: '&nbsp;&nbsp; <i class="ionicons ion-android-done-all"></i> &nbsp; ASSIGNED REVIEWS',
                    aTitle: 'Assigned Reviews'
                }
            )

            if($scope.isAdmin || $scope.isManager || $scope.isOwner) {
                ActionBarService.extraActionsMenu.push(
                    {
                        separator: true
                    },
                    {
                        clickAction: $scope.manageRubrics,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-settings"></i> &nbsp; MANAGE RUBRICS',
                        aTitle: 'Manage Rubrics'
                    }
                )
            }
        }

    }

    $scope.manageBreadCrumb = function (crumb) {
        var dt = $('.action-header .breadcrumb').find('li.peerAssessmentTitle');
        $('.action-header .breadcrumb li').removeClass('active');
        // var u = '#/cid/' + $scope.course._id + '?tab=discussion';
        if (dt.length > 0) {
            dt.html(crumb);
        } else {
            if ($scope.vName) {
                // $('.action-header .breadcrumb').find('li.tab').wrapInner('<a class="discussionTabLink" href="' + u + '"></a>');
                var newEl = '<li class="peerAssessmentTitle active">' + crumb + '</li>';
                $('.action-header .breadcrumb').append(newEl);
            }
        }
    };

    $scope.tabOpened();
});
