app.controller('AddEditRubricModalController', function($scope, $http, toastr) {
    $scope.saveRubric = function() {
        // Check for client side validation here

        var url = '/api/peerassessment/' + $scope.course._id + '/rubrics'
        if($scope.rubric._id) {
            url = url + '/' + $scope.rubric._id
        }

        $http.post(url, {title: $scope.rubric.title, description: $scope.rubric.description}).then(function(response) {
            toastr.success('Rubric saved');
            window.location.reload();
        }, function(err) {
            toastr.error('Internal Server Error. Please try again later.');
        })
    }
})