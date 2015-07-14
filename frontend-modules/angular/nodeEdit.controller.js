app.controller('NodeEditController', function($scope, $http, $rootScope) {

    $scope.formData = {};

    $scope.init = function(){
    };

    $scope.$on('onAfterSetMode', function(course){
        $scope.formData.courseId = course._id;
        $scope.formData.parent = $scope.currentNodeAction.parent;
    });

    $scope.saveNode = function(){
        var d = transformRequest($scope.formData);
        $http({
            method: 'POST',
            url: '/api/course/nodes',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    $scope.$emit('onAfterCreateNode', data.treeNode);
                } else {
                    if( !data.result){
                        $scope.errors = data.errors;
                        console.log(data.errors);
                    }
                }
            });
    };
});