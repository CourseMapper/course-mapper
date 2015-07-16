app.controller('NodeEditController', function($scope, $http, $rootScope) {

    $scope.formData = {};

    $scope.init = function(){
    };

    $scope.$on('onAfterSetMode', function(event, course){
        $scope.formData.courseId = course._id;

        if($scope.currentNodeAction.parent)
            $scope.formData.parent = $scope.currentNodeAction.parent._id;

        $scope.formData.type = "subTopic";
    });

    $scope.saveNode = function(){
        var d = transformRequest($scope.formData);
        $http({
            method: 'POST',
            url: '/api/treeNodes',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    $rootScope.$broadcast('onAfterCreateNode', data.treeNode);
                    $('#addSubTopicModal').modal('hide');
                    $('#addContentNodeModal').modal('hide');
                } else {
                    if( !data.result){
                        $scope.errors = data.errors;
                        console.log(data.errors);
                    }
                }

                // cleaining up formData
                $scope.formData.name = "";
                if($scope.formData.parent)
                    delete $scope.formData.parent;
            });
    };
});