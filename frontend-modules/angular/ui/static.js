app.controller('staticController', function($scope, $http, $rootScope) {

});
app.controller('aboutController', function($scope, $http, $rootScope, Page) {
    Page.setTitleWithPrefix('About CourseMapper');
});