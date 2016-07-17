app.controller('ManageRubricsController', function($scope, ActionBarService, $http, toastr) {
    console.log('Debug: ManageRubricsController')

    fetchRubrics = function() {
        var url = '/api/peerassessment/' + $scope.course._id + '/rubrics'
        $http.get(url).then(function(response) {
            if(response && response.data) {
                $scope.rubrics = response.data.rubrics;
            }
        }, function(err) {
            toastr.error('Internal Server Error. Please try again later.');
        })
    }

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
            },
            {
                separator: true
            },
            {
                clickAction: $scope.openRubric,
                title: '<i class="ionicons ion-android-add"></i> &nbsp; NEW RUBRIC',
                aTitle: 'New Rubric'
            }
        );

        fetchRubrics()
    }

    //$scope.saveRubric = function() {
    //    // Check for client side validation here
    //
    //    var url = '/api/peerassessment/' + $scope.course._id + '/rubrics'
    //    if($scope.rubric._id) {
    //        url = url + '/' + $scope.rubric._id
    //    }
    //
    //    $http.post(url, {title: $scope.rubric.title, description: $scope.rubric.description}).then(function(response) {
    //        toastr.success('Rubric saved');
    //        window.location.reload();
    //    }, function(err) {
    //        toastr.error('Internal Server Error. Please try again later.');
    //    })
    //}

    $scope.viewRubric = function(rubric) {
        console.log('Rubric: ', rubric)
        $scope.rubric = rubric
        $('#viewRubricModal').modal('show');
    }

    $scope.editRubric = function(rubric, event) {
        if(event)
            event.stopPropagation();
        if(rubric)
            $scope.rubric = rubric
        $('#addEditRubricModal').modal('show');
    }

    $scope.deleteRubric = function(rubricId, event) {
        if(event)
            event.stopPropagation();
        var url = '/api/peerassessment/' + $scope.course._id + '/rubrics/' + rubricId
        $http.delete(url).then(function(response) {
            toastr.success('Rubric successfully deleted');
            window.location.reload();
        }, function(err) {
            toastr.error('Internal Server Error. Please try again later.');
        })
    }

    // Setting rubric object to null for the reusability of the modal
    $("#addEditRubricModal").on('hidden.bs.modal', function () {
        $(this).data('bs.modal', null);
        $scope.rubric = null;
    });

    $("#viewRubricModal").on('hidden.bs.modal', function () {
        $scope.rubric = null;
    });

})