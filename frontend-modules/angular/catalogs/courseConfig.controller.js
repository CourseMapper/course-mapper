app.controller('CourseConfigController', function ($scope, $http) {
    $scope.courseEdit = null;
    $scope.errors = [];
    $scope.managersRaw = [];

    $scope.$on('onAfterInitCourse', function (event, course) {
        $scope.init(course);
    });

    $scope.init = function (course) {
        if(!course)
            return;

        $scope.courseEdit = cloneSimpleObject(course);

        $('#managerTagForm input').attr('readonly', 'readonly');

        if ($scope.courseEdit) {
            if($scope.courseEdit.managers && $scope.courseEdit.managers.length > 0){
                for(var i in $scope.courseEdit.managers) {
                    var t = $scope.courseEdit.managers[i];
                    $scope.managersRaw.push( {"text": t.username} );
                }
            }
        }
    };

    $scope.saveCourseSetting = function (isValid) {
        if(!isValid)
            return;

        if ($scope.managersRaw.length > 0) {
            var url = '/api/course/' + $scope.courseEdit._id + '/addManager';

            var params = {
                managers: JSON.stringify($scope.managersRaw)
            };
            var d = transformRequest(params);

            $scope.loading = true;
            $http.put(url, d)
                .success(function(res){
                    if(res.result){

                    }
                })
                .finally(function(){
                    $scope.loading = false;
                    toastr.success('You left the course');
                });
        }
    };

    $scope.cancel = function () {
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);
    };
});
