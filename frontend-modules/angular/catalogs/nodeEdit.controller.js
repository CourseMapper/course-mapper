app.controller('NodeEditController', function ($scope, $http, $rootScope, Upload, toastr, $timeout) {

  $scope.formData = {};
  $scope.filespdf = false;
  $scope.filesvideo = false;
  $scope.currentEditNode = false;
  $scope.progressPercentage = 0;
  $scope.videoHostLink = '';
  $scope.pdfHostLink = '';

  $scope.isLoading = false;
  $scope.errors = [];

  $scope.init = function () {
  };

  $scope.$on('onAfterSetMode', function (event, course, treeNode) {
    $scope.formData.courseId = course._id;

    if ($scope.currentNodeAction.parent)
      $scope.formData.parent = $scope.currentNodeAction.parent._id;
    else {
      if ($scope.formData.parent)
        delete $scope.formData.parent;
    }

    $scope.currentEditNode = $scope.currentNodeAction.parent;
    $scope.currentEditNodeOriginal = cloneSimpleObject($scope.currentNodeAction.parent);
    $scope.formData.type = $scope.currentNodeAction.type;

    if (treeNode) {
      $scope.formData.name = treeNode.name;
      //$scope.formData.isPrivate = treeNode.isPrivate;
      $scope.formData.nodeId = treeNode._id;
      $scope.currentEditNode = treeNode;
    }
  });

  $scope.parseNgFile = function (ngFile) {
    var t = ngFile.type.split('/')[1];

    var ret = {
      type: t
    };

    return ret;
  };

  /**
   * save add sub topic node
   */
  $scope.saveNode = function (isValid) {
    if (!isValid)
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
      .success(function (data) {
        if (data.result) {
          $rootScope.$broadcast('onAfterCreateNode', data.treeNode);

          $('#addSubTopicModal').modal('hide');
          $('#addContentNodeModal').modal('hide');

          // cleaining up formData
          if ($scope.formData.parent) {
            delete $scope.formData.parent;
            $timeout(function () {
              $scope.$apply()
            });
          }
          $scope.formData.name = "";
          $scope.formData.isPrivate = true;

          $scope.isLoading = false;
          $scope.addSubTopicForm.$setPristine();

          toastr.success('Successfully Saved, You can move it away from its default position');
        }
      })
      .error(function (data) {
        $scope.errors = data.errors;
        $scope.isLoading = false;

        toastr.error('Saving Failed');
      })
    ;
  };

  /**
   * save edit sub topic node
   */
  $scope.saveEditNode = function (isValid) {
    if (!isValid)
      return;

    var updateValue = {
      name: $scope.currentEditNode.name,
      // isPrivate: $scope.currentEditNode.isPrivate
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
      .success(function (data) {
        $scope.isLoading = false;
        if (data.result) {
          $rootScope.$broadcast('onAfterEditNode', data.treeNode);

          if ($scope.formData.parent) {
            $scope.currentEditNode = {};
            delete $scope.formData.parent;
            $timeout(function () {
              $scope.$apply()
            });
          }

          $('#editSubTopicModal').modal('hide');
          $('#editContentNodeModal').modal('hide');

          $scope.editSubTopicForm.$setPristine();
          toastr.success('Successfully Saved');
        }
      })
      .error(function (data) {
        $scope.isLoading = false;
        $scope.errors = data.errors;
        toastr.error('Saving Failed');
      });
  };

  /**
   * save add content node
   * save edit content node
   */
  $scope.saveContentNode = function (isValid) {
    if (!isValid)
      return;

    if ($scope.currentNodeAction.mode == 'edit') {
      $scope.formData = $scope.currentEditNode;
    }

    if ($scope.videoHostLink.trim() != '') {
      $scope.formData.videoHostLink = $scope.videoHostLink;
    }
    if ($scope.pdfHostLink.trim() != '') {
      $scope.formData.pdfHostLink = $scope.pdfHostLink;
    }
    var uploadParams = {
      url: '/api/treeNodes',
      fields: $scope.formData
    };

    uploadParams.file = [];

    // we only take one pdf file
    if ($scope.filespdf) {
      uploadParams.file.push($scope.filespdf);
    }
    // we only take one vid file
    if ($scope.filesvideo) {
      uploadParams.file.push($scope.filesvideo);
    }

    $scope.isLoading = true;

    $scope.upload = Upload.upload(
      uploadParams
    ).progress(function (evt) {
      if (!evt.config.file)
        return;

      $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);

    }).success(function (data, status, headers, config) {

      if (data.result) {
        if (uploadParams.file.length > 0) {
          /*data.treeNode['resources'] = [];
           for (var i in uploadParams.file) {
           var f = uploadParams.file[i];
           var resTemp = $scope.parseNgFile(f);
           data.treeNode['resources'].push(resTemp);
           }*/

          /*if ($scope.videoHostLink != '') {
           data.treeNode['resources'].push({
           type: 'videoLink'
           });
           }*/

          /*if ($scope.pdfHostLink != '') {
           data.treeNode['resources'].push({
           type: 'pdfLink'
           });
           }*/
        }
      }

      if ($scope.addContentNodeForm) {
        $rootScope.$broadcast('onAfterCreateNode', data.treeNode);

        $('#addSubTopicModal').modal('hide');
        $('#addContentNodeModal').modal('hide');

        // cleaning up formData
        $scope.formData.name = "";
        $scope.formData.isPrivate = true;

        $scope.filespdf = false;
        $scope.filesvideo = false;

        if ($scope.formData.parent)
          delete $scope.formData.parent;

        $scope.addContentNodeForm.$setPristine();

        toastr.success('Content Node has been created, You can move it away from its default position');
      } else if ($scope.editContentNodeForm) {
        $rootScope.$broadcast('onAfterEditContentNode', data.treeNode);

        $('#editContentNodeModal').modal('hide');
        $scope.editContentNodeForm.$setPristine();

        toastr.success('Successfully Saved');
      }

      $scope.videoHostLink = '';
      $scope.pdfHostLink = '';
      $scope.formData.videoHostLink = '';
      $scope.formData.pdfHostLink = '';
      uploadParams.file = [];
      $scope.progressPercentage = 0;

      $scope.isLoading = false;
    })
      .error(function (data) {
        $scope.isLoading = false;
        $scope.errors = data.errors;

        $scope.progressPercentage = 0;

        toastr.error('Saving Failed');
      });

  };

  $scope.cancel = function () {
    if ($scope.upload) {
      $scope.upload.abort();
    }

    $scope.currentEditNode.name = $scope.currentEditNodeOriginal.name;
    $scope.currentEditNode.isPrivate = $scope.currentEditNodeOriginal.isPrivate;
  };

  $scope.clearVideo = function () {
    $scope.filesvideo = false;
    $timeout(function () {
      $scope.$apply()
    });
  };

  $scope.clearPdf = function () {
    $scope.filespdf = false;
    $timeout(function () {
      $scope.$apply()
    });
  };
});
