
app.controller('CourseEditController', function($scope, $filter, $http, $location, Upload) {
    $scope.createdDate = new Date();
    $scope.courseEdit = null;
    $scope.tagsRaw = [];
    $scope.files = [];
    $scope.errors = "";

    $scope.$on('onAfterInitCourse', function(crs){
        $scope.init();
    });

    $scope.init = function(){
        $scope.tagsRaw = [];

        if(!$scope.courseEdit)
            $scope.courseEdit = cloneSimpleObject($scope.$parent.course);

        if($scope.courseEdit)
        if($scope.courseEdit.courseTags && $scope.courseEdit.courseTags.length > 0){
            for(var i in $scope.courseEdit.courseTags) {
                var t = $scope.courseEdit.courseTags[i];
                $scope.tagsRaw.push( {"text": t.name} );
            }
        }
    };

    /*$scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category._id + '/courseTags?query=' + query);
    };*/

    $scope.saveCourse = function() {
        if($scope.tagsRaw) {
            $scope.courseEdit.tags = JSON.stringify($scope.tagsRaw);
        }

        var uploadParams = {
            url: '/api/course/' + $scope.courseEdit._id,
            fields: {
                name: $scope.courseEdit.name,
                description: $scope.courseEdit.description,
                tags: $scope.courseEdit.tags,
            }
        };

        // we only take one file
        if ($scope.files && $scope.files.length){
            var file = $scope.files[0];
            uploadParams.file = file;
        }

        Upload.upload(
            uploadParams

        ).progress(function (evt) {
                if(!evt.config.file)
                    return;

                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);

        }).success(function (data, status, headers, config) {
            $scope.$emit('onAfterEditCourse', data.course);
            $('#editView').modal('hide');
        });
    };

    $scope.cancel = function(){
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);
    };
});

