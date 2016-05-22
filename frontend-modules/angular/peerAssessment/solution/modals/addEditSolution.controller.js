app.controller('AddEditSolutionController', function($scope, $http, toastr, $window, Upload) {
    $scope.selSolutionDocuments = false;
    $scope.progress = 0;

    $scope.deleteUploadedFiles = function(fileName) {
        for(var i=0; i<$scope.solutionObj.displayDocumentsList.length; i++) {
            if ($scope.solutionObj.displayDocumentsList[i].link == fileName) {
                if(!$scope.solutionObj.deletedUploadedFiles) {
                    $scope.solutionObj.deletedUploadedFiles = [];
                }
                $scope.solutionObj.deletedUploadedFiles.push($scope.solutionObj.solutionDocuments[i]);
                $scope.solutionObj.solutionDocuments.splice(i,1);
                $scope.solutionObj.displayDocumentsList.splice(i,1);
                break;
            }
        }
        console.log('Check deleted Objects', $scope.solutionObj.deletedUploadedFiles, $scope.solutionObj.solutionDocuments, $scope.solutionObj.displayDocumentsList);
    }

    $scope.deleteSelectedFiles = function(fileName) {
        console.log('Review Docs Selected', $scope.selSolutionDocuments, fileName);
        for(var i=0; i<$scope.selSolutionDocuments.length; i++) {
            if($scope.selSolutionDocuments[i].name == fileName) {
                $scope.selSolutionDocuments.splice(i,1);
                break;
            }
        }
    }

    $scope.updateSolution = function(solutionObj) {
        console.log(solutionObj);
        console.log('dsadasdas',$scope.solutionObj)
        var params = {
            //isSubmitted: true,
            studentComments: solutionObj.studentComments,
            solutionDocuments: solutionObj.solutionDocuments,
            deletedUploadedFiles: solutionObj.deletedUploadedFiles
        }
        $scope.isLoading = true;
        var uploadParams = {
            method: 'PUT',
            url: '/api/peerassessment/' + $scope.$parent.course._id + '/peerreviews/' + solutionObj.peerReviewId + '/solutions/' + solutionObj._id,
            fields: params
        };
        uploadParams.file = [];
        if($scope.selSolutionDocuments) {
            uploadParams.file.push({'selSolutionDocuments':$scope.selSolutionDocuments});
        }

        $scope.upload = Upload.upload(
            uploadParams
            )
            .progress(function (evt) {
                if (!evt.config.file)
                    return;

                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
                // console.log("Progress", $scope.progress);
            })
            .success(function (data) {

                $scope.progress = 0;
                if (data.result) {
                    toastr.success('Successfully Saved');
                } else {
                    toastr.error('Updating Solution Failed');
                }
                $scope.isLoading = false;
                $('#addEditSolutionModal').modal('hide');

                window.location.reload();
            })
            .error(function (data) {
                toastr.error('Updating Solution Failed');
                $scope.errors = data.errors;
                $scope.progress = 0;
                $scope.isLoading = false;
            });
    }
})