app.controller('NodeConfigController', function ($scope, $http, toastr, $window) {
    $scope.nodeEdit = null;
    $scope.errors = [];
    $scope.username = '';
    $scope.isLoading = false;
    $scope.tabsActive = {};
    $scope.settings = {
        disableControls: false,
        disableTop: false
    };

    $scope.$on('onAfterInitTreeNode', function (event, treeNode) {
        $scope.init(treeNode);
    });

    $scope.init = function (treeNode) {
        if (!treeNode)
            return;

        $scope.nodeEdit = cloneSimpleObject(treeNode);
    };

    $scope.saveNodeSetting = function (isValid) {
        if (!isValid)
            return;

        var url = '/api/treeNodes/' + $scope.nodeEdit._id;

        var params = {};

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

    $scope.cancel = function () {
        $scope.nodeEdit = cloneSimpleObject($scope.$parent.treeNode);
    };
});
