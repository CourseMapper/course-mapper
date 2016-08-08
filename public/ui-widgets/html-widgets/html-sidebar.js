angular.module('UIWidgets', ['toastr'])
    .controller("HtmlSidebarController", function ($scope, $http, $timeout) {
        $scope.editAction = function () {
            $('#sidebarEditForm').on('shown.bs.modal', function () {
                $timeout(function () {
                    $('#sidebarEditForm .box-body').css('height', '500px');
                }, 100);
            });

            $('#sidebarEditForm').modal('show');

            var grid = $('.grid-stack').data('gridstack');
            grid.movable('.grid-stack-item', false);
        };

        $scope.init = function (wdg) {
            $scope.widget = wdg;

            $('#w' + $scope.widget._id + ' .config-button').bind('click mousedown mouseup touchstart', $scope.editAction);

            /*var editModalOrig = jQuery('#sidebarEditFormWrapper');
            var editModal = editModalOrig.html().replace('sidebarEditForm', 'sidebarEditForm2');
            editModalOrig.hide();
            jQuery('body').append(editModal);*/
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

                    if (!$scope.originalWidget.options)
                        $scope.originalWidget.options = {};

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
