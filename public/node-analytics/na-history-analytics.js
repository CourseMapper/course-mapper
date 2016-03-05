
angular.module('NodeHistoryAnalytics', ['chart.js'])
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
    .controller("NodeHistoryAnalyticsController", ['$scope', '$rootScope', '$filter', '$http', '$location', '$routeParams', function ($scope, $rootScope, $filter, $http, $location, $routeParams) {

        $scope.title = "Node Analytics History Chart";
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

        $scope.nodeId = $routeParams.nodeId;


        //get pdf annotation history for one year range max
        $http.get('/api/node-analytics/node-history/pdf-annotations/'+$scope.nodeId).success(function(result){
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
        $http.get('/api/node-analytics/node-history/video-annotations/'+$scope.nodeId).success(function(result){
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
        $http.get('/api/node-analytics/node-history/links/'+$scope.nodeId).success(function(result){
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

    }]);

