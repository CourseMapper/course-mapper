app.controller('RubricController', function($scope, ActionBarService, $http, toastr) {
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

    fetchRubrics()

    $scope.toggleSelection = function(rId) {
        var idx = $scope.newAssignObj.reviewSettings.rubrics.indexOf(rId);
        if(idx > -1) {
            $scope.newAssignObj.reviewSettings.rubrics.splice(idx, 1);
        } else {
            $scope.newAssignObj.reviewSettings.rubrics.push(rId);
        }
        console.log($scope.newAssignObj.reviewSettings.rubrics);
    }

    if($scope.newAssignObj && $scope.newAssignObj.reviewSettings && !$scope.newAssignObj.reviewSettings.rubrics) {
        $scope.newAssignObj.reviewSettings.rubrics = []
    }
})