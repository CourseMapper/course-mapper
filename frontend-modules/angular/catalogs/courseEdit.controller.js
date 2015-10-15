
app.controller('CourseEditController', function($scope, $filter, $http, $location, Upload) {
    $scope.createdDate = new Date();
    $scope.courseEdit = null;
    $scope.tagsRaw = [];
    $scope.files = [];
    $scope.filespicture = [];
    $scope.filesvideo = [];

    $scope.isLoading = false;
    $scope.errors = [];

    $scope.progressPercentage = 0;

    $scope.$on('onAfterInitCourse', function(event, course){
        $scope.init();
    });

    $scope.init = function(){
        $scope.tagsRaw = [];

        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);

        if($scope.courseEdit)
        if($scope.courseEdit.courseTags && $scope.courseEdit.courseTags.length > 0){
            for(var i in $scope.courseEdit.courseTags) {
                var t = $scope.courseEdit.courseTags[i];
                $scope.tagsRaw.push( {"text": t.name} );
            }
        }
    };

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

        uploadParams.file = [];
        // we only take one picture file
        if ($scope.filespicture && $scope.filespicture.length){
            uploadParams.file.push($scope.filespicture[0]);
        }
        // we only take one vid file
        if ($scope.filesvideo && $scope.filesvideo.length){
            uploadParams.file.push($scope.filesvideo[0]);
        }

        $scope.isLoading = true;
        $scope.upload = Upload.upload(
            uploadParams

        ).progress(function (evt) {
            if(!evt.config.file)
                return;

            $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        })
            .success(function (data) {
                $scope.$emit('onAfterEditCourse', data.course);

                $scope.filespicture = [];
                $scope.filesvideo = [];

                $scope.isLoading = false;
                $('#editView').modal('hide');

                $scope.progressPercentage = 0;
            })

            .error(function(){
                $scope.isLoading = false;
                $scope.errors = data.errors;

                $scope.progressPercentage = 0;
            });
    };

    $scope.cancel = function(){
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);

        if($scope.upload){
            $scope.upload.abort();
        }
    };
});
