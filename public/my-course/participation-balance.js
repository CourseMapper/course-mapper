'use strict';

angular.module('ParticipationBalance', [''])
    .controller('ParticipationBalanceController', function ($scope, $http) {

        var WeightedValue = function (value, weight) {
            this.value = value;
            this.weight = weight;
        };

        function buildHSL(h, s, l) {
            return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
        }

        function normalizeValue(value) {
            if (!value) {
                return 0;
            } else if (value > 1) {
                return 1;
            } else if (value < 0) {
                return 0;
            }
            return value;
        }

        $scope.percentToHSLColor = function (value) {
            var normalizedValue = normalizeValue(value);
            var h, s, l;
            h = (normalizedValue) * 320;
            s = 70;
            l = 40;
            return buildHSL(h, s, l);
        };

        $scope.getParticipationBalance = function (node) {
            // var sources = [
            //     new WeightedValue($scope.getWatchProgress(node), 1),
            //     new WeightedValue($scope.getAnnotationProgress(node), 2),
            //     new WeightedValue($scope.getLinksProgress(node), 3)
            // ];
            var sources = [
                new WeightedValue($scope.getWatchProgress(node), 1),
                new WeightedValue($scope.getAnnotationProgress(node), 2),
                new WeightedValue($scope.getExtResourcesProgress(node), 3)
            ];

            var sum = _(sources)
                .map(function (c) {
                    return c.value * c.weight;
                })
                .reduce(function (m, n) {
                    return m + n;
                }, 0);

            var count = _(sources)
                .map(function (c) {
                    return c.weight;
                })
                .reduce(function (m, n) {
                    return m + n;
                });

            return (sum / count);
        };

        $scope.getExtResourcesProgress = function (node) {
            return node.totalExtResources > 0 ? (node.userExtResources / node.totalExtResources) : 0;
        };

        $scope.getLinksProgress = function (node) {
            return node.totalLinks > 0 ? (node.userLinks / node.totalLinks) : 0;
        };

        $scope.getAnnotationProgress = function (node) {
            return node.totalAnnotations > 0 ? (node.userAnnotations / node.totalAnnotations) : 0;
        };

        $scope.getWatchProgress = function (node) {
            var wh = node.watchHistory;
            if (!wh || !wh.totalTime) {
                return 0;
            }
            return (wh.currentTime / wh.totalTime);
        };

        $scope.expandState = {};

        $scope.setExpandState = function (value) {
            var states = $scope.expandState;
            for (let id in states) {
                states[id] = value;
            }
        };

        $scope.init = function () {
            $http.get('/api/my-course/participation-balance')
                .then(function (res) {
                    $scope.courses = res.data;
                });
        };

        $scope.init();
    });