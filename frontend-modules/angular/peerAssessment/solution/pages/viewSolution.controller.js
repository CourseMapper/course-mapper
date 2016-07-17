app.controller('ViewSolutionController', function($scope, $location, $http, toastr, ActionBarService) {
    $scope.vId = $location.search().vId;
    if($scope.vName && $scope.vId) {
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
                        },
                        {
                            separator: true
                        },
                        {
                            clickAction: $scope.giveFeedback,
                            clickParams: $scope.solution._id,
                            title: '&nbsp;&nbsp; <i class="ionicons ion-checkmark-circled"></i> &nbsp; FEEDBACK',
                            aTitle: 'Feedback'
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