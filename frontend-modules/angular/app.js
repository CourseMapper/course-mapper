var app = angular.module('courseMapper', [
    'ngResource', 'ngRoute', 'ngCookies',
    'ngTagsInput', 'ngFileUpload', 'oc.lazyLoad',
    'relativeDate', 'wysiwyg.module', 'angular-quill',
    'VideoAnnotations', 'SlideViewerAnnotationZones',
    'ngAnimate', 'toastr', 'externalApp']);

app.config(function (toastrConfig) {
    angular.extend(toastrConfig, {
        positionClass: 'toast-top-center',
        preventOpenDuplicates: true,
        maxOpened: 1
    });
});
