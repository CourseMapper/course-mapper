
app.controller('CourseEditController', function($scope, $filter, $http, $location, Upload) {
    $scope.createdDate = new Date();
    $scope.course = cloneSimpleObject($scope.$parent.course);
    $scope.tagsRaw = [];
    $scope.files = [];
    $scope.errors = undefined;

    if($scope.course.courseTags && $scope.course.courseTags.length > 0){
        for(var i in $scope.course.courseTags) {
            var t = $scope.course.courseTags[i];
            $scope.tagsRaw.push( {"text": t.name} );
        }
    }

    /*$scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category._id + '/courseTags?query=' + query);
    };*/

    $scope.saveCourse = function() {
        if($scope.tagsRaw) {
            $scope.course.tags = JSON.stringify($scope.tagsRaw);
        }

        var uploadParams = {
            url: '/api/course/' + $scope.course._id,
            fields: {
                name: $scope.course.name,
                description: $scope.course.description,
                tags: $scope.course.tags,
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
            /*.finally(function(){
                $scope.$parent.course.courseTags = $scope.de;
            });*/


        /*var d = transformRequest($scope.course);
        $http({
            method: 'PUT',
            url: '/api/courses',
            data: d,
            headers: {
                'Content-Type': undefined
            }
        })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    $scope.$emit('onAfterEditCourse');
                    //window.location.href = '/course/' + data.course.slug + '/#/cid/' + data.course._id + '?new=1';
                } else {
                    if( data.result != null && !data.result){
                        $scope.errorName = data.errors;
                        console.log(data.errors);
                    }
                }
            }) ;*/
    };

    $scope.cancel = function(){
        $scope.course = cloneSimpleObject($scope.$parent.course);
    };
});

