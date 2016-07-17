app.controller('ReviewAssignmentController', function($scope, $http, toastr, $window, $location, ActionBarService) {
    console.log('Debug: ReviewAssignmentController')
    vId = $location.search().vId;
    if(!vId) {
        return
    }
    $scope.user = null;
    $scope.solution = null;
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

    console.log('Peer Review Id: ', vId)
    var url = '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + vId + '/reviews/new';
    $http.get(url).then(function (response) {
        console.log(response.data);
        if(response && response.data) {
            $scope.assignedReviews = response.data.assignedReviews;
            $scope.users = response.data.users;
            $scope.solutions = response.data.solutions;
            if($scope.users.length)
                $scope.user = $scope.users[0]._id;
            if($scope.solutions.length)
                $scope.solution = $scope.solutions[0]._id;
        }
    }, function(err) {
        toastr.error('Internal Server error. Please try again later');
    });

    $scope.assignReview = function() {
        if(!$scope.user || !$scope.solution) {
            toastr.error('Please select a valid student and solution before assigning');
            return;
        }
        console.log($scope.user, $scope.solution)

        var url = '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + vId + '/reviews/assign';
        $http.post(url, {assignedTo: $scope.user, solutionId: $scope.solution}).then(function(response) {
            console.log($scope.solution)
            if(response && response.data && response.data.result) {
                toastr.success('Review successfully created');
                window.location.reload();
            } else {
                toastr.error('Internal Server error. Please try again later');
            }
        }, function(err) {
            toastr.error('Internal Server error. Please try again later');
        });
    }

    $scope.deleteReview = function(id, e) {
        var url = '/api/peerassessment/' + $scope.course._id + '/peerreviews/' + vId + '/reviews/' + id;
        $http.delete(url).then(function(response) {
            if(response && response.data && response.data.result) {
                toastr.success('Review successfully deleted');
                window.location.reload();
            } else {
                toastr.error('Internal Server error. Please try again later');
            }
        }, function(err) {
            toastr.error('Internal Server error. Please try again later');
        })
    }
})