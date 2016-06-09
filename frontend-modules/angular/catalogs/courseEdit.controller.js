app.controller('CourseEditController', function ($scope, $filter, $http, $location, Upload, toastr) {
  $scope.createdDate = new Date();
  $scope.courseEdit = null;
  $scope.tagsRaw = [];
  $scope.files = [];
  $scope.filespicture = false;
  $scope.filesvideo = false;

  $scope.isLoading = false;
  $scope.errors = [];

  $scope.progressPercentage = 0;

  $scope.$on('onAfterInitCourse', function (event, course) {
    $scope.init(course);
  });

  $scope.init = function (course) {
    if (!course)
      return;
    $scope.tagsRaw = [];
    $scope.courseEdit = cloneSimpleObject(course);

    if ($scope.courseEdit)
      if ($scope.courseEdit.courseTags && $scope.courseEdit.courseTags.length > 0) {
        for (var i in $scope.courseEdit.courseTags) {
          var t = $scope.courseEdit.courseTags[i];
          $scope.tagsRaw.push({"text": t.name});
        }
      }
  };

  $scope.saveCourse = function () {
    if ($scope.tagsRaw) {
      $scope.courseEdit.tags = JSON.stringify($scope.tagsRaw);
    }

    var uploadParams = {
      url: '/api/course/' + $scope.courseEdit._id,
      fields: {
        name: $scope.courseEdit.name,
        description: $scope.courseEdit.description,
        smallDescription: $scope.courseEdit.smallDescription,
        tags: $scope.courseEdit.tags
      }
    };

    uploadParams.file = [];
    // we only take one picture file
    if ($scope.filespicture) {
      uploadParams.file.push($scope.filespicture);
    }
    // we only take one vid file
    if ($scope.filesvideo) {
      uploadParams.file.push($scope.filesvideo);
    }

    $scope.isLoading = true;
    $scope.upload = Upload.upload(
      uploadParams
    )
      .progress(function (evt) {
        if (!evt.config.file)
          return;

        $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      })

      .success(function (data) {
        $scope.$emit('onAfterEditCourse', data.course);

        $scope.filespicture = false;
        $scope.filesvideo = false;

        $scope.isLoading = false;
        $('#editView').modal('hide');

        $scope.progressPercentage = 0;

        var slg = data.course.slug;
        if (data.course.name != $scope.$parent.course.name)
          window.location.href = '/course/' + slg + '/#/cid/' + data.course._id + '?tab=preview';
        else
          window.location.reload();
      })

      .error(function (data) {
        $scope.isLoading = false;
        $scope.errors = data.errors;

        $scope.progressPercentage = 0;
      });
  };

  $scope.deleteVideo = function () {
    $http.post('/api/course/' + $scope.courseEdit._id, {
      video: "delete",
      name: $scope.courseEdit.name
    })
      .success(function (data) {
        $scope.courseEdit.video = false;
        $scope.$emit('onAfterEditCourse', data.course);
        toastr.success('Video deleted');
      })
      .error(function () {
        toastr.error('Video delete failed');
      });
  };

  $scope.deletePicture = function () {
    $http.post('/api/course/' + $scope.courseEdit._id, {
      picture: "delete",
      name: $scope.courseEdit.name
    })
      .success(function (data) {
        $scope.courseEdit.video = false;
        $scope.$emit('onAfterEditCourse', data.course);
        toastr.success('Picture deleted');
      })
      .error(function () {
        toastr.error('Picture delete failed');
      });
  };

  $scope.cancel = function () {
    $scope.courseEdit = cloneSimpleObject($scope.$parent.course);

    if ($scope.upload) {
      $scope.upload.abort();
    }
  };
});
