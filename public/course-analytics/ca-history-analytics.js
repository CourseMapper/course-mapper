angular.module('HistoryAnalytics', ['chart.js', 'highcharts-ng'])
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
//controller for Course Analytics widget
.controller("BarHistoryAnalyticsController", ['$scope', '$rootScope', '$filter', '$http', '$location', '$routeParams', '$timeout', function ($scope, $rootScope, $filter, $http, $location, $routeParams, $timeout) {

    //draw chart container first, then push data into series
    //navigator: zoom slider
    //scrollbar: scrollbar at bottom
    //inputEnabled: date input selector top right
    $scope.chartConfig = {
        options: {
            rangeSelector : {
                buttons	: [{
                    type	: 'week',
                    count	: 1,
                    text	: '1w'
                },{
                    type	: 'month',
                    count	: 1,
                    text	: '1m'
                },{
                    type	: 'all',
                    text	: 'All'
                }],
                selected : 2,
                inputEnabled: true
            },
            legend: {
                enabled: true
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    second: '%H:%M',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%Y<br/>%m-%d',
                    week: '%Y<br/>%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                }
            },
            global: {
                useUTC: true
            },
            chart: {
                zoomType: 'x',
                height: 250

            },
            inputEnabled: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled:false
            }

        },
        func: function(chart) {
            $timeout(function() {
                chart.reflow();
            }, 0);
        },

        series: [],
        useHighStocks: true

    };

    $scope.courseId = $routeParams.courseId;

    //get enrolled user history for one year range max
    $http.get('/api/course-analytics/course-history/enrolled-users/'+$scope.courseId).success(function (result) {
        var tempArray = [];
        var temp ={};

        $scope.resultEnrolledUser = result.users ;
        $scope.resultEnrolledUser.forEach(function(r){

            var year = new Date(r.dateUpdated).getFullYear();
            var mth = new Date(r.dateUpdated).getMonth();
            var day = new Date(r.dateUpdated).getDate();
            var objectName = Date.UTC(year, mth, day);
            if( typeof temp[objectName] != "undefined" )
                temp[objectName].value = temp[objectName].value + 1;
            else
                temp[objectName] = { data: objectName, value: 1};
        });
        for (var index in temp) {
            var val = temp[index];
            tempArray.push([val.data, val.value]);
        }
        var myDataUserEnrolled = {
            id: 1,
            name: 'Enrolled Users',
            type: 'spline',
            data: tempArray
        };

        $scope.chartConfig.series.push(myDataUserEnrolled);


    });

    //get pdf upload history for one year range max
    $http.get('/api/course-analytics/course-history/pdf-upload/'+$scope.courseId).success(function(result){
        var tempArray = [];
        var temp ={};

        $scope.resultPdfUpload = result.pdf;
        $scope.resultPdfUpload.forEach(function(r){
            var year = new Date(r.dateAdded).getFullYear();
            var mth = new Date(r.dateAdded).getMonth();
            var day = new Date(r.dateAdded).getDate();
            var objectName = Date.UTC(year, mth, day);
            if (typeof temp[objectName] != "undefined")
                temp[objectName].value = temp[objectName].value + 1;
            else
                temp[objectName] = {data: objectName , value: 1};
        });
        for (var index in temp) {
            var val = temp[index];
            tempArray.push([val.data, val.value]);
        }

        var myDataPdfUpload = {
            id: 2,
            name: 'PDF Files',
            type: 'spline',
            data: tempArray
        };

        $scope.chartConfig.series.push(myDataPdfUpload);

    });

    //get video upload history for one year range max
    $http.get('/api/course-analytics/course-history/video-upload/'+$scope.courseId).success(function(result){
        var tempArray = [];
        var temp ={};
        $scope.resultVideoUpload = result.videos;
        $scope.resultVideoUpload.forEach(function(r){
            var year = new Date(r.dateAdded).getFullYear();
            var mth = new Date(r.dateAdded).getMonth();
            var day = new Date(r.dateAdded).getDate();
            var objectName = Date.UTC(year, mth, day);
            if (typeof temp[objectName] != "undefined")
                temp[objectName].value = temp[objectName].value + 1;
            else
                temp[objectName] = {data: objectName, value: 1};
        });
        for (var index in temp) {
            var val = temp[index];
            tempArray.push([val.data, val.value]);
        }
        var myDataVideoUpload = {
            id: 3,
            name: 'Videos',
            type: 'spline',
            data: tempArray
        };

        $scope.chartConfig.series.push(myDataVideoUpload);

    });

    //get discussion history for one year range max
    $http.get('/api/course-analytics/course-history/discussions/'+$scope.courseId).success(function(result){
        var tempArray = [];
        var temp ={};
        $scope.resultDiscussion = result.discussions;
        $scope.resultDiscussion.forEach(function(r){
            var year = new Date(r.dateAdded).getFullYear();
            var mth = new Date(r.dateAdded).getMonth();
            var day = new Date(r.dateAdded).getDate();
            var objectName = Date.UTC(year, mth, day);
            if (typeof temp[objectName] != "undefined")
                temp[objectName].value = temp[objectName].value + 1;
            else
                temp[objectName] = {data: objectName, value: 1};
        });
        for (var index in temp) {
            var val = temp[index];
            tempArray.push([val.data, val.value]);
        }
        var myDataDiscussion = {
            id: 4,
            name: 'Discussion Topics',
            type: 'spline',
            data: tempArray
        };

        $scope.chartConfig.series.push(myDataDiscussion);

    });

}])
//controller for Node Analytics widget
.controller("NodeCourseHistoryAnalyticsController", ['$scope', '$rootScope', '$filter', '$http', '$location', '$routeParams', '$timeout', function ($scope, $rootScope, $filter, $http, $location, $routeParams, $timeout) {
    
    $scope.chartNodeConfig = {
        options: {
            rangeSelector : {
                buttons	: [{
                    type	: 'week',
                    count	: 1,
                    text	: '1w'
                },{
                    type	: 'month',
                    count	: 1,
                    text	: '1m'
                },{
                    type	: 'all',
                    text	: 'All'
                }],
                selected : 2,
                inputEnabled: true
            },
            legend: {
                enabled: true
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    second: '%H:%M',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%Y<br/>%m-%d',
                    week: '%Y<br/>%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                }
            },
            global: {
                useUTC: true
            },
            chart: {
                zoomType: 'x',
                height: 250

            },
            inputEnabled: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled:false
            }

        },
        func: function(chart) {
            $timeout(function() {
                chart.reflow();
            }, 0);
        },

        series: [],
        useHighStocks: true

    };

    //using highchart get pdf annotation history for one year range max
    $http.get('/api/course-analytics/course-history/pdf-annotations/'+$scope.courseId).success(function(result){
        var temp ={};
        var tempArray = [];
        $scope.resultPdfAnnotations = result.pdfAnnotations;
        $scope.resultPdfAnnotations.forEach(function(r){

            var year = new Date(r.dateOfCreation).getFullYear();
            var mth = new Date(r.dateOfCreation).getMonth();
            var day = new Date(r.dateOfCreation).getDate();
            var objectName = Date.UTC(year, mth, day);
            if( typeof temp[objectName] != "undefined" )
                temp[objectName].value = temp[objectName].value + 1;
            else
                temp[objectName] = { data: objectName, value: 1};

        });
        for (var index in temp) {
            var val = temp[index];
            tempArray.push([val.data, val.value]);
        }


        var myDataPdfAnno = {
            id: 1,
            name: 'PDF Annotations',
            type: 'spline',
            data: tempArray
        };
        $scope.data = myDataPdfAnno;
        $scope.chartNodeConfig.series.push(myDataPdfAnno);
    });

    //get video annotation history for one year range max
    $http.get('/api/course-analytics/course-history/video-annotations/'+$scope.courseId).success(function(result){
        var tempArray = [];
        var temp ={};
        $scope.resultVideoAnnotations = result.videoAnnotations;
        $scope.resultVideoAnnotations.forEach(function(r){
            var year = new Date(r.date_created).getFullYear();
            var mth = new Date(r.date_created).getMonth();
            var day = new Date(r.date_created).getDate();
            var objectName = Date.UTC(year, mth, day);
            if (typeof temp[objectName] != "undefined")
                temp[objectName].value = temp[objectName].value + 1;
            else
                temp[objectName] = {data: objectName, value: 1};
        });
        for (var index in temp) {
            var val = temp[index];
            tempArray.push([val.data, val.value]);
        }
        var myDataVideoAnno = {
            id: 2,
            name: 'Video Annotations',
            type: 'spline',
            data: tempArray
        };

        $scope.chartNodeConfig.series.push(myDataVideoAnno);

    });

    // //get submitted links history for one year range max
    // $http.get('/api/course-analytics/course-history/links/'+$scope.courseId).success(function(result){
    //     var tempArray = [];
    //     var temp ={};
    //     $scope.resultLinks = result.links;
    //     $scope.resultLinks.forEach(function(r){
    //         var year = new Date(r.dateAdded).getFullYear();
    //         var mth = new Date(r.dateAdded).getMonth();
    //         var day = new Date(r.dateAdded).getDate();
    //         var objectName = Date.UTC(year, mth, day);
    //         if (typeof temp[objectName] != "undefined")
    //             temp[objectName].value = temp[objectName].value + 1;
    //         else
    //             temp[objectName] = {data: objectName, value: 1};
    //     });
    //     for (var index in temp) {
    //         var val = temp[index];
    //         tempArray.push([val.data, val.value]);
    //     }
    //     var myDataLink = {
    //         id: 3,
    //         name: 'Link',
    //         type: 'spline',
    //         data: tempArray
    //     };
    //
    //     $scope.chartNodeConfig.series.push(myDataLink);
    //
    // });

    $http.get('/api/course-analytics/course-history/external-resources/'+$scope.courseId).success(function(result){
        var tempArray = [];
        var temp ={};
        $scope.resultLinks = result.links;
        $scope.resultLinks.forEach(function(r){
            var year = new Date(r.dateAdded).getFullYear();
            var mth = new Date(r.dateAdded).getMonth();
            var day = new Date(r.dateAdded).getDate();
            var objectName = Date.UTC(year, mth, day);
            if (typeof temp[objectName] != "undefined")
                temp[objectName].value = temp[objectName].value + 1;
            else
                temp[objectName] = {data: objectName, value: 1};
        });
        for (var index in temp) {
            var val = temp[index];
            tempArray.push([val.data, val.value]);
        }
        var myDataLink = {
            id: 3,
            name: 'External Resources',
            type: 'spline',
            data: tempArray
        };

        $scope.chartNodeConfig.series.push(myDataLink);

    });
}]);
