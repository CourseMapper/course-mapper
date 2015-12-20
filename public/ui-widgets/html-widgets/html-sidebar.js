angular.module('UIWidgets', ['toastr'])
    .controller("HtmlSidebarToolController", function ($scope, $http, $timeout) {

        $scope.editAction = function (wdg) {
            $('#sidebarEditForm').modal('show');

            var grid = $('.grid-stack').data('gridstack');
            grid.movable('.grid-stack-item', false);
        };
    })

    .controller("HtmlSidebarController", function ($scope, $http, $timeout) {

        $scope.init = function (wdg) {
            $scope.widget = wdg;
        };

        $scope.refresh = function (wdg) {
            $http.get('/api/widget/' + wdg._id)

                .success(function (data) {
                    if (data.widget) {
                        $scope.widget = data.widget;
                    }
                })

                .error(function (errors) {
                    console.log(errors);
                });
        };
    })

    .controller("EditHtmlController", function ($scope, $http, $timeout, toastr) {
        $scope.isLoading = false;

        $scope.init = function (wdg) {
            $scope.originalWidget = wdg;
            $scope.widgetData = angular.copy(wdg);
        };

        $scope.saveWidget = function () {
            $scope.isLoading = true;

            $http.put('/api/widget/' + $scope.widgetData._id + '/edit', $scope.widgetData)

                .success(function (res) {
                    if (res.result) {
                        toastr.success('Successfully Saved');
                    }

                    $scope.isLoading = false;
                    $('#sidebarEditForm').modal('hide');

                    $scope.errors = [];

                    var grid = $('.grid-stack').data('gridstack');
                    grid.movable('.grid-stack-item', true);

                    $scope.originalWidget.options.content = res.widget.options.content;
                    $scope.originalWidget.widget = res.widget.widget;
                })

                .error(function (res) {
                    $scope.errors = res.errors;
                    $scope.isLoading = false;
                    toastr.error('Save Failed');

                    var grid = $('.grid-stack').data('gridstack');
                    grid.movable('.grid-stack-item', true);
                });
        };

        $scope.cancel = function () {
            var grid = $('.grid-stack').data('gridstack');
            grid.movable('.grid-stack-item', true);
        }
    });
