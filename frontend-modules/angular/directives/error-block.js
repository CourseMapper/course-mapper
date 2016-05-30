app.directive('errorBlock',
    function () {
        return {
            restrict: 'E',
            scope: {
                messages: '='
            },
            template: '<div class="errors">' +
                      '<div class="alert alert-danger" role="alert" ng-repeat="m in messages">{{m}}</div>' +
                      '</div>'
        };
    });