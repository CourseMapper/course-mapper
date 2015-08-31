videoAnnotationsModule.directive('vaEditor', function() {
    return {
        scope: {
            annotation: '='
        },
        templateUrl: '/video-annotations/scripts/directives/va-editor/va-editor.html',
        controller: 'VaEditorController'
    };
});
