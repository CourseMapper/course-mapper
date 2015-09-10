app.directive('cancel',
    function () {
        return {
            restrict: 'E',
            template: '<button type="button" class="btn btn-warning"' +
            'data-dismiss="modal" aria-label="Close"' +
            'ng-click="cancel()">' +
            '<span aria-hidden="true">Cancel</span>' +
            '</button>'
        };
    });

app.directive('modalClose',
    function () {
        return {
            restrict: 'E',
            template: '<div class="box-tools pull-right"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>'
        };
    });