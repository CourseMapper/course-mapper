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
                review.solutionPublicationDate = new Date(review.solutionPublicationDate);
                review.ssPublicationDate = review.solutionPublicationDate;
                delete review.solutionPublicationDate;
                review.reviewDescription = review.description;
                delete review.description;
            });
            $scope.peerreviews = response.data.peerreviews;
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });

        $scope.initiateView();
    }

    // Delete Modal
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

    $scope.openDeleteSolutionConfirmationModal = function(solutionId, event) {
        if(event) {
            event.stopPropagation();
        }
        $scope.deleteSolutionId = solutionId;
        $('#confirmDeleteSolutionModal').modal('show');
    }

    // Edit Modal
    $scope.openEditConfirmationModal = function(review, event) {
        if(event) {
            event.stopPropagation();
        }
        console.log('review', review);
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

        $scope.newAssignObj = _.extend({}, review);
        $('#editAssignmentModal').modal('show');
    }

    // Solution Modal
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
            $scope.solutionObj = response.data.solution;
            if(paramsObj.path !== 'solutionList') {
                $scope.solutionObj.peerReviewTitle = response.data.title;
            }

            if($scope.solutionObj && $scope.solutionObj.solutionDocuments && $scope.solutionObj.solutionDocuments.length>0) {
                $scope.solutionObj.displayDocumentsList = [];
                _.each($scope.solutionObj.solutionDocuments, function(docName) {
                    var temp = {};
                    temp.link = window.location.origin + docName;
                    var tempArr = docName.split('/');
                    temp.name = tempArr[tempArr.length-1];
                    $scope.solutionObj.displayDocumentsList.push(temp);
                })
            }

            $('#addEditSolutionModal').modal('show');
        }, function(err) {
            console.log('err', err);
        })
    }

    $scope.viewPeerReview = function(review) {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewPeerReview&vId=' + review._id;
    }

    $scope.viewSolution = function(solution) {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewSolution&vId=' + solution._id;
    }
    $scope.viewAllSolutions = function() {
        window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewSolutionsList';
    }

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
            }
        } else {
            $scope.currentView = 'main.tpl';
            ActionBarService.extraActionsMenu = [];
            if($scope.isAdmin || $scope.isManager || $scope.isOwner) {
                ActionBarService.extraActionsMenu.push(
                    {
                        'html': '<a style="cursor: pointer;"' +
                        ' data-toggle="modal" data-target="#addNewAssignmentModal"' +
                        ' title="New Peer Review">' +
                        '&nbsp;&nbsp; <i class="ionicons ion-android-add"></i> &nbsp; NEW PEER REVIEW</a>'
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

app.controller('ViewSolutionController', function($scope, $location, $http, toastr, ActionBarService) {
    $scope.vId = $location.search().vId;
    if($scope.vName && $scope.vId) {
        ActionBarService.extraActionsMenu = [];
        ActionBarService.extraActionsMenu.push(
            {
                clickAction: $scope.redirectPRHome,
                title: '<i class="ionicons ion-home"></i> &nbsp; PEER REVIEWS HOME',
                aTitle: 'Peer Review Home'
            }
        );
        var url = '/api/peerassessment/' + $scope.course._id + '/solutions/' + $scope.vId;
        $http.get(url).then( function(response) {
            console.log('response', response);
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
                if($scope.isAdmin || $scope.isManager || $scope.isOwner) {
                    // for openAddEditSolutionModal to know that it has been called from this path
                    $scope.solution.path = 'solutionList';
                    ActionBarService.extraActionsMenu.push(
                        {
                            separator: true
                        },
                        {
                            clickAction: $scope.openAddEditSolutionModal,
                            clickParams: $scope.solution,
                            title: '&nbsp;&nbsp; <i class="ionicons ion-edit"></i> &nbsp; EDIT',
                            aTitle: 'Edit Solution'
                        },
                        {
                            clickAction: $scope.openDeleteSolutionConfirmationModal,
                            clickParams: $scope.solution._id,
                            title: '&nbsp;&nbsp; <i class="ionicons ion-ios-trash"></i> &nbsp; DELETE',
                            aTitle: 'Delete Solution'
                        }
                    );
                }
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        })
    }
})

app.controller('SolutionsController', function($scope, $location, $http, toastr, ActionBarService) {
    $scope.solutions = null;
    if($scope.vName) {
        ActionBarService.extraActionsMenu = [];
        ActionBarService.extraActionsMenu.push(
            {
                clickAction: $scope.redirectPRHome,
                title: '<i class="ionicons ion-home"></i> &nbsp; PEER REVIEWS HOME',
                aTitle: 'Peer Review Home'
            }
        );
    }

    $scope.requestData = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/solutions';
        $http.get(url).then( function(response) {
            _.each(response.data.solutions, function(solution) {
                // do something if needed
            });
            $scope.solutions = response.data.solutions;
            console.log('Solutions', $scope.solutions);
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });
    }

    $scope.deleteSolution = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/solutions/' + $scope.deleteSolutionId;
        $http.delete(url).then( function(response) {
            if(response && response.data.result) {
                if ($location.search().vId) {
                    window.document.location = '#/cid/' + $scope.course._id + '?tab=peerAssessment&vName=viewSolutionsList';
                    window.location.reload();
                    //$location.search('vName', 'viewSolutionsList');
                    //$location.search('vId', '');
                } else {
                    window.location.reload();
                }
            }
            // if you want to do it with ajax check the logic of deleting peer reviews in Peer Review controller
        }, function(err) {
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });

        $('#confirmDeleteAssignmentModal').modal('hide');
    }

    if($scope.course && $scope.course._id) {
        $scope.requestData();
    } else {
        console.log('Course not initialized');
    }
})

app.controller('ViewPeerReviewController', function($scope, $location, $http, toastr, ActionBarService) {
    $scope.vId = $location.search().vId;
    if($scope.vName && $scope.vId) {
        $scope.viewReview = null;
        ActionBarService.extraActionsMenu = [];

        ActionBarService.extraActionsMenu.push(
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
            console.log('Resp', response);
            var review = response.data.peerReview;
            review.publicationDate = new Date(review.publicationDate);
            review.dueDate = new Date(review.dueDate);
            review.solutionPublicationDate = new Date(review.solutionPublicationDate);
            review.ssPublicationDate = review.solutionPublicationDate;
            delete review.solutionPublicationDate;
            review.reviewDescription = review.description;
            delete review.description;

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

            if(review.groupSubmission) {
                review.groupSubmission = 'Yes';
            } else {
                review.groupSubmission = 'No';
            }

            $scope.viewReview = review;
            if($scope.isAdmin || $scope.isManager || $scope.isOwner) {
                ActionBarService.extraActionsMenu.push(
                    {
                        clickAction: $scope.openEditConfirmationModal,
                        clickParams: $scope.viewReview,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-edit"></i> &nbsp; EDIT',
                        aTitle: 'Edit Peer Review'
                    },
                    {
                        clickAction: $scope.openDeleteConfirmationModal,
                        clickParams: $scope.viewReview._id,
                        title: '&nbsp;&nbsp; <i class="ionicons ion-ios-trash"></i> &nbsp; DELETE',
                        aTitle: 'Delete Peer Review'
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
                    }
                );
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });
    }
})

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

app.controller('EditPeerReviewController', function($scope, $http, toastr, $window, Upload){

    console.log($scope, $scope.newAssignObj);

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
});

app.controller('AddEditSolutionController', function($scope, $http, toastr, $window, Upload) {
    $scope.selSolutionDocuments = false;
    $scope.progress = 0;

    $scope.deleteUploadedFiles = function(fileName) {
        for(var i=0; i<$scope.solutionObj.displayDocumentsList.length; i++) {
            if ($scope.solutionObj.displayDocumentsList[i].link == fileName) {
                if(!$scope.solutionObj.deletedUploadedFiles) {
                    $scope.solutionObj.deletedUploadedFiles = [];
                }
                $scope.solutionObj.deletedUploadedFiles.push($scope.solutionObj.solutionDocuments[i]);
                $scope.solutionObj.solutionDocuments.splice(i,1);
                $scope.solutionObj.displayDocumentsList.splice(i,1);
                break;
            }
        }
        console.log('Check deleted Objects', $scope.solutionObj.deletedUploadedFiles, $scope.solutionObj.solutionDocuments, $scope.solutionObj.displayDocumentsList);
    }

    $scope.deleteSelectedFiles = function(fileName) {
        console.log('Review Docs Selected', $scope.selSolutionDocuments, fileName);
        for(var i=0; i<$scope.selSolutionDocuments.length; i++) {
            if($scope.selSolutionDocuments[i].name == fileName) {
                $scope.selSolutionDocuments.splice(i,1);
                break;
            }
        }
    }

    $scope.updateSolution = function(solutionObj) {
        console.log(solutionObj);
        console.log('dsadasdas',$scope.solutionObj)
        var params = {
            //isSubmitted: true,
            studentComments: solutionObj.studentComments,
            solutionDocuments: solutionObj.solutionDocuments,
            deletedUploadedFiles: solutionObj.deletedUploadedFiles
        }
        $scope.isLoading = true;
        var uploadParams = {
            method: 'PUT',
            url: '/api/peerassessment/' + $scope.$parent.course._id + '/peerreviews/' + solutionObj.peerReviewId + '/solutions/' + solutionObj._id,
            fields: params
        };
        uploadParams.file = [];
        if($scope.selSolutionDocuments) {
            uploadParams.file.push({'selSolutionDocuments':$scope.selSolutionDocuments});
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
                    toastr.error('Updating Solution Failed');
                }
                $scope.isLoading = false;
                $('#addEditSolutionModal').modal('hide');

                window.location.reload();
            })
            .error(function (data) {
                toastr.error('Updating Solution Failed');
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }
})