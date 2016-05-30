
angular.module('MyPdfStatus', [''])
    .controller('PdfStatusController', function($scope, $http) {
        //$scope.title = "List of PDF History";
        $http.get('/api/my-course/pdf-history').success(function (data) {
            $scope.pdfHistory = data.pdfHistory;
            $scope.sortType = 'dateUpdated';
            $scope.sortReverse = 'false';
        });
    });