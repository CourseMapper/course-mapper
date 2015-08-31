videoAnnotationsModule.directive('vaWidget',
    function() {
        return {
            scope: {
                videoSource: '@',
                videoId: '@'
            },
            templateUrl: '/video-annotations/scripts/directives/va-widget/va-widget.html',
            controller: 'VaWidgetController'
        };
    }
);
