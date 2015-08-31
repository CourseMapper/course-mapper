videoAnnotationsModule.directive('vaWidget',
    function () {
        return {
            scope: {
                resource: '='
            },
            templateUrl: '/video-annotations/scripts/directives/va-widget/va-widget.html',
            controller: 'VaWidgetController'
        };
    }
);
