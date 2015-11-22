app.controller('NodeDetailController', function ($scope, $rootScope, $filter, $http, $location,
                                                 $routeParams, $timeout, ActionBarService) {
    $scope.deleteNode = function (id) {
        var msg = 'Are you sure you want to delete this content node?';

        if (confirm(msg)) {
            $http({
                method: 'DELETE',
                url: '/api/treeNodes/' + id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (res) {
                    if (res.result) {
                        $location.path('/cid/' + $scope.courseId);
                        $location.search('tab', 'map');
                    } else {
                        if (data.result != null && !data.result) {
                            $scope.errors = data.errors;
                            console.log(data.errors);
                        }
                    }
                });
        }
    };

    $scope.manageActionBar = function () {
        if (($scope.currentTab == 'video' || $scope.currentTab == 'pdf') && $scope.treeNode) {
            if (
                $scope.treeNode.createdBy == $rootScope.user._id) {

                ActionBarService.extraActionsMenu = [];

                ActionBarService.extraActionsMenu.push({
                    clickAction: $scope.deleteNode,
                    clickParams: $scope.treeNode._id,
                    title: '<i class="ionicons ion-close"></i> &nbsp;DELETE',
                    aTitle: 'DELETE THIS NODE AND ITS CONTENTS'
                });
            }
        }
    };

    $scope.changeTab = function () {
        var q = $location.search();

        if (!q.tab) {

            jQuery('#video').removeClass('active');
            jQuery('li.video').removeClass('active');

            jQuery('#pdf').removeClass('active');
            jQuery('li.pdf').removeClass('active');

            if ($scope.isVideoExist && $scope.isPdfExist) {
                jQuery('#video').addClass('active');
                jQuery('li.video').addClass('active');
            } else if ($scope.isPdfExist) {
                jQuery('#pdf').addClass('active');
                jQuery('li.pdf').addClass('active');
            } else {
                jQuery('#video').addClass('active');
                jQuery('li.video').addClass('active');
            }
        }

        if ($scope.isVideoExist && $scope.isPdfExist) {
            $scope.defaultPath = 'video';
        } else if ($scope.isPdfExist) {
            $scope.defaultPath = 'pdf';
        }

        $scope.currentTab = $scope.defaultPath;
        if (q.tab) {
            $scope.currentTab = q.tab;
        }

        $scope.actionBarTemplate = 'actionBar-node-' + $scope.currentTab;

        $rootScope.$broadcast('onNodeTabChange', $scope.currentTab);

        $scope.manageActionBar();
    };

    $scope.init();
});
