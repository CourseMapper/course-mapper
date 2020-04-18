
angular.module('NodeHistoryAnalytics', ['chart.js', 'highcharts-ng'])
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
    .controller("NodeHistoryAnalyticsController", ['$scope', '$rootScope', '$filter', '$http', '$location', '$routeParams', '$timeout', function ($scope, $rootScope, $filter, $http, $location, $routeParams, $timeout) {

        $scope.nodeId = $routeParams.nodeId;

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
                    selected : 1,
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


        //get pdf annotation history for one year range max
        $http.get('/api/node-analytics/node-history/pdf-annotations/'+$scope.nodeId).success(function(result){
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
        $http.get('/api/node-analytics/node-history/video-annotations/'+$scope.nodeId).success(function(result){
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
        // $http.get('/api/node-analytics/node-history/links/'+$scope.nodeId).success(function(result){
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
        // });

        //get submitted links history for one year range max
        $http.get('/api/node-analytics/node-history/external-resources/'+$scope.nodeId).success(function(result){
            var tempArray = [];
            var temp ={};
            $scope.resultExtResources = result.extResources;
            $scope.resultExtResources.forEach(function(r){
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

