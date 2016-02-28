
angular.module('HistoryAnalytics', ['chart.js'])
.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
        //colours: ['#FF5252', '#FF8A80'],
        backgroundColor : ['#ECF0F5'],
        responsive: true
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
        datasetFill: false
    });
}])
.controller("BarHistoryAnalyticsController", ['$scope', '$rootScope', '$filter', '$http', '$location', '$routeParams', function ($scope, $rootScope, $filter, $http, $location, $routeParams) {

    $scope.title = "Course Analytics History Chart";
    //$scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September"];
    $scope.enrolledUsersData = [];

    Date.prototype.formatMMDDYYYY = function() {
        return (this.getMonth() + 1) +
            "/" +  this.getDate() +
            "/" +  this.getFullYear();
    };
    Date.prototype.formatMMYYYY = function() {
        return ( this.getMonth() + 1) +
            "/" +  this.getFullYear();
    };

    $scope.courseId = $routeParams.courseId;


    //get enrolled user history for one year range max
    $http.get('/api/course-analytics/course-history/enrolled-users/'+$scope.courseId).success(function (result) {
        var arrTemp = [];
        var monthTemp ={};
        $scope.labelEnrolledUserMonthly =[]; $scope.dataEnrolledUserMonthly=[];

        //$scope.lblTgl = [];
        //$scope.abc = [];
        $scope.resultEnrolledUser = result.users ;
        $scope.resultEnrolledUser.forEach(function(r){
            //var objFullDate = new Date(r.dateAdded).formatMMDDYYYY();
            //$scope.lblTgl.push(objFullDate);
            //$scope.abc.push(1);

            var objectName = new Date(r.dateUpdated).formatMMYYYY();
            if( typeof monthTemp[objectName] != "undefined" )
                monthTemp[objectName].value = monthTemp[objectName].value + 1;
            else
                monthTemp[objectName] = { data: new Date(r.dateUpdated).formatMMYYYY(), value: 1};
        });
        for( var index in monthTemp){
            var val = monthTemp[index];
            $scope.labelEnrolledUserMonthly.push(val.data);
            arrTemp.push(val.value);
        }
        //$scope.xyz = [$scope.abc];
        $scope.dataEnrolledUserMonthly.push(arrTemp);


    });

    //get pdf upload history for one year range max
    $http.get('/api/course-analytics/course-history/pdf-upload/'+$scope.courseId).success(function(result){
        var arrTemp = [];
        var monthTemp ={};
        $scope.labelPdfUploadMonthly = []; $scope.dataPdfUploadMonthly=[];
        $scope.resultPdfUpload = result.pdf;
        $scope.resultPdfUpload.forEach(function(r){
           var objectName = new Date(r.dateAdded).formatMMYYYY();
            if (typeof monthTemp[objectName] != "undefined")
                monthTemp[objectName].value = monthTemp[objectName].value + 1;
            else
                monthTemp[objectName] = {data: new Date(r.dateAdded).formatMMYYYY(), value: 1};
        });
        for (var index in monthTemp) {
            var val = monthTemp[index];
            $scope.labelPdfUploadMonthly.push(val.data);
            arrTemp.push(val.value);
        }

        $scope.dataPdfUploadMonthly.push(arrTemp);

    });

    //get video upload history for one year range max
    $http.get('/api/course-analytics/course-history/video-upload/'+$scope.courseId).success(function(result){
        var arrTemp = [];
        var monthTemp ={};
        $scope.labelVideoUploadMonthly = []; $scope.dataVideoUploadMonthly=[];
        $scope.resultVideoUpload = result.videos;
        $scope.resultVideoUpload.forEach(function(r){
            var objectName = new Date(r.dateAdded).formatMMYYYY();
            if (typeof monthTemp[objectName] != "undefined")
                monthTemp[objectName].value = monthTemp[objectName].value + 1;
            else
                monthTemp[objectName] = {data: new Date(r.dateAdded).formatMMYYYY(), value: 1};
        });
        for (var index in monthTemp) {
            var val = monthTemp[index];
            $scope.labelVideoUploadMonthly.push(val.data);
            arrTemp.push(val.value);
        }
        $scope.dataVideoUploadMonthly.push(arrTemp);

    });

    //get discussion history for one year range max
    $http.get('/api/course-analytics/course-history/discussions/'+$scope.courseId).success(function(result){
        var arrTemp = [];
        var monthTemp ={};
        $scope.labelDiscussionMonthly = []; $scope.dataDiscussionMonthly=[];
        $scope.resultDiscussion = result.discussions;
        $scope.resultDiscussion.forEach(function(r){
            var objectName = new Date(r.dateAdded).formatMMYYYY();
            if (typeof monthTemp[objectName] != "undefined")
                monthTemp[objectName].value = monthTemp[objectName].value + 1;
            else
                monthTemp[objectName] = {data: new Date(r.dateAdded).formatMMYYYY(), value: 1};
        });
        for (var index in monthTemp) {
            var val = monthTemp[index];
            $scope.labelDiscussionMonthly.push(val.data);
            arrTemp.push(val.value);
        }
        $scope.dataDiscussionMonthly.push(arrTemp);

    });

    //get pdf annotation history for one year range max
    $http.get('/api/course-analytics/course-history/pdf-annotations/'+$scope.courseId).success(function(result){
        var arrTemp = [];
        var monthTemp ={};
        $scope.labelPdfAnnotationMonthly = []; $scope.dataPdfAnnotationMonthly=[];
        $scope.resultPdfAnnotations = result.pdfAnnotations;
        $scope.resultPdfAnnotations.forEach(function(r){
            var objectName = new Date(r.dateOfCreation).formatMMYYYY();
            if (typeof monthTemp[objectName] != "undefined")
                monthTemp[objectName].value = monthTemp[objectName].value + 1;
            else
                monthTemp[objectName] = {data: new Date(r.dateOfCreation).formatMMYYYY(), value: 1};
        });
        for (var index in monthTemp) {
            var val = monthTemp[index];
            $scope.labelPdfAnnotationMonthly.push(val.data);
            arrTemp.push(val.value);
        }
        $scope.dataPdfAnnotationMonthly.push(arrTemp);

    });

    //get video annotation history for one year range max
    $http.get('/api/course-analytics/course-history/video-annotations/'+$scope.courseId).success(function(result){
        var arrTemp = [];
        var monthTemp ={};
        $scope.labelVideoAnnotationMonthly = []; $scope.dataVideoAnnotationMonthly=[];
        $scope.resultVideoAnnotations = result.videoAnnotations;
        $scope.resultVideoAnnotations.forEach(function(r){
            var objectName = new Date(r.date_modified).formatMMYYYY();
            if (typeof monthTemp[objectName] != "undefined")
                monthTemp[objectName].value = monthTemp[objectName].value + 1;
            else
                monthTemp[objectName] = {data: new Date(r.date_modified).formatMMYYYY(), value: 1};
        });
        for (var index in monthTemp) {
            var val = monthTemp[index];
            $scope.labelVideoAnnotationMonthly.push(val.data);
            arrTemp.push(val.value);
        }
        $scope.dataVideoAnnotationMonthly.push(arrTemp);

    });

    //get submitted links history for one year range max
    $http.get('/api/course-analytics/course-history/links/'+$scope.courseId).success(function(result){
        var arrTemp = [];
        var monthTemp ={};
        $scope.labelLinksMonthly = []; $scope.dataLinksMonthly=[];
        $scope.resultLinks = result.links;
        $scope.resultLinks.forEach(function(r){
            var objectName = new Date(r.dateUpdated).formatMMYYYY();
            if (typeof monthTemp[objectName] != "undefined")
                monthTemp[objectName].value = monthTemp[objectName].value + 1;
            else
                monthTemp[objectName] = {data: new Date(r.dateUpdated).formatMMYYYY(), value: 1};
        });
        for (var index in monthTemp) {
            var val = monthTemp[index];
            $scope.labelLinksMonthly.push(val.data);
            arrTemp.push(val.value);
        }
        $scope.dataLinksMonthly.push(arrTemp);

    });

/*
    $scope.testLbl = ["1/6/2016","1/11/2016","2/10/2016","2/10/2016","2/14/2016"];
    $scope.testData = [[5,10,10,8,3]];*/

}]);
