app.controller('SolutionsController', function($scope, $location, $http, toastr, ActionBarService, SolutionFilterService) {
    var solutions = null;
    $scope.filteredSolutions = null;
    $scope.peerReviewList = null;
    $scope.filterCondition = '';
    $scope.filterCondition = SolutionFilterService.getPeerReview()
    console.log('FilterCondition: ', $scope.filterCondition)
    if($scope.vName) {
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
    }

    $scope.requestData = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/solutions';
        $http.get(url).then( function(response) {
            if(response.data.solutions && response.data.solutions.length) {
                $scope.peerReviewList = _.pluck(response.data.solutions, 'peerReviewId')
                $scope.peerReviewList = _.without($scope.peerReviewList, null, undefined)
                console.log('PeerReviewList', $scope.peerReviewList)
                $scope.peerReviewList = _.uniq($scope.peerReviewList, function(p) {return p._id})
                $scope.peerReviewList.push({_id: '', title: 'No Filter'})
                solutions = response.data.solutions;
                console.log('Solutions', solutions);
                if($scope.filterCondition != '') {
                    var matched = false;
                    _.each($scope.peerReviewList, function(pr) {
                        if(pr._id == $scope.filterCondition) {
                            matched = true
                        }
                    })
                    if(!matched) {
                        SolutionFilterService.setPeerReview('')
                        $scope.filterCondition = SolutionFilterService.getPeerReview()
                    }
                }
                $scope.filter()
            }
        }, function(err){
            // Check for proper error message later
            toastr.error('Internal Server Error. Please try again later.');
        });
    }

    $scope.filter = function() {
        console.log('FilteredSolutions: ', $scope.filterCondition)
        if($scope.filterCondition == '') {
            console.log('Null')
            SolutionFilterService.setPeerReview('')
            $scope.filteredSolutions = solutions
        } else {
            console.log('Not null')
            SolutionFilterService.setPeerReview($scope.filterCondition)
            $scope.filteredSolutions = _.filter(solutions, function(solution) {
                return solution.peerReviewId._id == $scope.filterCondition
            })
        }
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