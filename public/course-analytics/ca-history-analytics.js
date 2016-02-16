
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
        /* NVD3 options
        $scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 55
                },
                x: function(d){ return d.dateAdded; },
                y: function(d){ return d.user; },
                showValues: true,
                valueFormat: function(d){
                    return d3.format(',.4f')(d);
                },
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'X Axis'
                },
                yAxis: {
                    axisLabel: 'Y Axis',
                    axisLabelDistance: 30
                }
            }
        };
*/


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
/*
    $scope.testLbl = ["1/6/2016","1/11/2016","2/10/2016","2/10/2016","2/14/2016"];
    $scope.testData = [[5,10,10,8,3]];*/

}]);
