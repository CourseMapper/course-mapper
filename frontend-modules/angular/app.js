var app = angular.module('courseMapper', [
    'ngResource', 'ngRoute', 'ngCookies',
    'ngTagsInput', 'ngFileUpload', 'oc.lazyLoad',
    'relativeDate', 'angular-quill',
    'VideoAnnotations', 'SlideViewerAnnotationZones',
    'LearningHub',
    'ngAnimate', 'toastr', 'externalApp', 'daterangepicker', 'uiSwitch']);

app.config(function (toastrConfig) {
    angular.extend(toastrConfig, {
        positionClass: 'toast-top-center',
        preventOpenDuplicates: true,
        maxOpened: 1
    });
});