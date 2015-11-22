app.controller('NodeConfigController', function ($scope, $http, toastr, $window) {
    $scope.nodeEdit = null;
    $scope.errors = [];
    $scope.managersRaw = [];
    $scope.managersIdRaw = [];
    $scope.username = '';
    $scope.isLoading = false;
    $scope.tabsActive = {};
    $scope.settings = {
        disableControls: false,
        disableTop: false
    };

    $scope.$on('onAfterInitCourse', function (event, course) {
        $scope.init(course);
    });

    $scope.init = function (treeNode) {
        if (!treeNode)
            return;

        $scope.nodeEdit = cloneSimpleObject(treeNode);
    };

    $scope.saveNodeSetting = function (isValid) {
        if (!isValid)
            return;

        $scope.managersIdRaw = [];

        var url = '/api/course/' + $scope.courseEdit._id + '/settings';
        $scope.managersIdRaw = [];
        if ($scope.managersRaw.length > 0) {
            for (var i in $scope.managersRaw) {
                $scope.managersIdRaw.push($scope.managersRaw[i]._id);
            }
        }

        var params = {
            managers: JSON.stringify($scope.managersIdRaw)
        };

        if ($scope.tabsActive) {
            params.tabsActive = $scope.tabsActive;
        }
        if ($scope.settings) {
            params.settings = $scope.settings;
        }

        $scope.isLoading = true;
        $http.put(url, params)
            .success(function (res) {
                if (res.result) {
                    toastr.success('Successfully Saved');
                }

                $scope.managersIdRaw = [];

                $scope.isLoading = false;
                $('#configView').modal('hide');
                $scope.errors = [];

                $window.location.reload();
            })
            .error(function (res) {
                $scope.errors = res.errors;
                $scope.isLoading = false;
            });
    };

    $scope.removeUsername = function ($tag) {
        console.log('removed ' + JSON.stringify($tag));
    };

    $scope.cancel = function () {
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);
    };
});
