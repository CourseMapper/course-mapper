app.controller('NodeEditController', function($scope, $http, $rootScope, Upload) {

    $scope.formData = {};
    $scope.filespdf = [];
    $scope.filesvideo = [];
    $scope.currentEditNode = false;

    $scope.isLoading = false;
    $scope.errors = [];

    $scope.init = function(){
    };

    $scope.$on('onAfterSetMode', function(event, course, treeNode){
        $scope.formData.courseId = course._id;

        if($scope.currentNodeAction.parent)
            $scope.formData.parent = $scope.currentNodeAction.parent._id;

        $scope.currentEditNode = $scope.currentNodeAction.parent;
        $scope.currentEditNodeOriginal = cloneSimpleObject($scope.currentNodeAction.parent);
        $scope.formData.type = $scope.currentNodeAction.type;

        if(treeNode){
            $scope.formData.name = treeNode.name;
            $scope.formData.nodeId = treeNode._id;
            $scope.currentEditNode = treeNode;
        }
    });

    $scope.parseNgFile = function(ngFile){
        var t = ngFile.type.split('/')[1];

        var ret = {
            type: t
        };

        return ret;
    };

    /**
     * save add sub topic node
     */
    $scope.saveNode = function(isValid){
        if(!isValid)
            return;

        $scope.isLoading = true;
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
                if(data.result) {
                    $rootScope.$broadcast('onAfterCreateNode', data.treeNode);

                    $('#addSubTopicModal').modal('hide');
                    $('#addContentNodeModal').modal('hide');

                    // cleaining up formData
                    if($scope.formData.parent) {
                        delete $scope.formData.parent;
                    }
                    $scope.formData.name = "";

                    $scope.isLoading = false;
                    $scope.addSubTopicForm.$setPristine();
                }
            })
            .error(function(data){
                $scope.errors = data.errors;
                $scope.isLoading = false;
            })
        ;
    };

    /**
     * save edit sub topic node
     */
    $scope.saveEditNode = function(isValid){
        if(!isValid)
            return;

        var updateValue = {
            name: $scope.currentEditNode.name
        };

        $scope.isLoading = true;

        var d = transformRequest(updateValue);
        $http({
            method: 'PUT',
            url: '/api/treeNodes/' + $scope.currentEditNode._id,
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                $scope.isLoading = false;
                if(data.result) {
                    $rootScope.$broadcast('onAfterEditNode', data.treeNode);

                    $('#editSubTopicModal').modal('hide');
                    $('#editContentNodeModal').modal('hide');

                    $scope.editSubTopicForm.$setPristine();
                }
            })
            .error(function(data){
                $scope.isLoading = false;
                $scope.errors = data.errors;
            });
    };

    /**
     * save add content node
     * save edit content node
     */
    $scope.saveContentNode = function(isValid){
        if(!isValid)
            return;

        if($scope.currentNodeAction.mode == 'edit'){
            $scope.formData = $scope.currentEditNode;
        }

        var uploadParams = {
            url: '/api/treeNodes',
            fields: $scope.formData
        };

        uploadParams.file = [];
        // we only take one pdf file
        if ($scope.filespdf && $scope.filespdf.length){
            uploadParams.file.push($scope.filespdf[0]);
        }
        // we only take one vid file
        if ($scope.filesvideo && $scope.filesvideo.length){
            uploadParams.file.push($scope.filesvideo[0]);
        }

        $scope.isLoading = true;

        Upload.upload(
            uploadParams

        ).progress(function (evt) {
                if(!evt.config.file)
                    return;

                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                if(Array.isArray(evt.config.file) && evt.config.file.length > 0){
                    for(var i in evt.config.file){
                        var fle = evt.config.file[i];
                        console.log('progress: ' + progressPercentage + '% ' + fle.name);
                    }
                } else {
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }

            }).success(function (data, status, headers, config) {
                console.log(data);

                if(data.result) {
                    data.treeNode['resources'] = [];
                    for(var i in uploadParams.file){
                        var f = uploadParams.file[i];
                        var resTemp = $scope.parseNgFile(f);
                        data.treeNode['resources'].push(resTemp);
                    }
                }

                if($scope.addContentNodeForm) {
                    $rootScope.$broadcast('onAfterCreateNode', data.treeNode);

                    $('#addSubTopicModal').modal('hide');
                    $('#addContentNodeModal').modal('hide');

                    // cleaning up formData
                    $scope.formData.name = "";
                    $scope.filespdf = [];
                    $scope.filesvideo = [];

                    if($scope.formData.parent)
                        delete $scope.formData.parent;

                    $scope.addContentNodeForm.$setPristine();
                } else if($scope.editContentNodeForm){
                    $rootScope.$broadcast('onAfterEditContentNode', data.treeNode);

                    $('#editContentNodeModal').modal('hide');
                    $scope.editContentNodeForm.$setPristine();
                }

                $scope.isLoading = false;
            })
            .error(function(data){
                $scope.isLoading = false;
                $scope.errors = data.errors;
            });

    };

    $scope.cancel = function(){
        $scope.currentEditNode.name = $scope.currentEditNodeOriginal.name;
    }
});
