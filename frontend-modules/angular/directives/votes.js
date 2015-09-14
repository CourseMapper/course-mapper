app.directive('voting',
    function () {
        return {
            restrict: 'E',

            scope: {
                voteType: '@',
                voteTypeId: '@',
                voteValue: '@',
                voteTotal: '@',
                voteDisplay: '@'
            },

            template: '<div class="voting">' +
            '<a class="cursor" ng-click="sendVote(\'up\')"><div class="btn-up" ng-class="getClassUp()">' +
            '<i class="ionicons ion-ios-arrow-up" ng-hide="(voteValue == 1)"></i>' +
            '<i class="ionicons ion-chevron-up" ng-show="(voteValue == 1)"></i>' +
            '</div></a>' +
            '<div class="vote-total">{{voteDisplay}}</div>' +
            '<a class="cursor"><div class="btn-down" ng-class="getClassDown()" ng-click="sendVote(\'down\')">' +
            '<i class="ionicons ion-ios-arrow-down" ng-hide="(voteValue == -1)"></i>' +
            '<i class="ionicons ion-chevron-down" ng-show="(voteValue == -1)"></i>' +
            '</div></a>' +
            '</div>',

            controller: function ($scope, $compile, $http, $attrs) {
                $scope.errors = [];

                if($attrs.voteTotal)
                    $scope.voteDisplay = $attrs.voteTotal;
                else
                    $scope.voteDisplay = 0;

                $scope.$watchGroup(['voteType', 'voteTypeId'], function () {
                    if ($scope.voteType != null && $scope.voteTypeId != "" && $scope.voteTotal == null) {
                        $scope.getVoteTotal();
                    }
                });

                $scope.getVoteTotal = function () {
                    $scope.isLoading = true;
                    $http.get('/api/votes/' + $scope.voteType + '/id/' + $scope.voteTypeId)
                        .success(function(data){
                            if(data.result && data.vote.length > 0){
                                $scope.voteTotal = data.vote[0].total;
                                $scope.voteDisplay = data.vote[0].total;

                                if(data.vote[0].isVotingObject){
                                    $scope.voteValue = data.vote[0].isVotingObject.voteValue;
                                    if($scope.voteValue == 1)
                                        $scope.voteTotal -= 1;
                                    else if($scope.voteValue == -1)
                                        $scope.voteTotal += 1;

                                    $scope.voteDisplay = $scope.voteTotal + $scope.voteValue;
                                }
                            }
                            $scope.isLoading = false;
                        })
                        .error(function(data){
                            $scope.errors = data.errors;
                            $scope.isLoading = false;
                        });
                };

                $scope.getClassUp = function () {
                    // this person is voting up this content
                    if ($scope.voteValue == 1) {
                        return 'voted';
                    }
                };

                $scope.getClassDown = function () {
                    // this person is voting up this content
                    if ($scope.voteValue == -1) {
                        return 'voted';
                    }
                };

                $scope.sendVote = function (val) {
                    $scope.isLoading = true;

                    if (($scope.voteValue == 1 && val == 'up') || ($scope.voteValue == -1 && val == 'down')) {
                        val = 'reset';
                    }

                    $http({
                        method: 'POST',
                        url: '/api/votes/' + $scope.voteType + '/id/' + $scope.voteTypeId + '/' + val,
                        //data: d,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })
                        .success(function (data) {
                            console.log(data);
                            if (data.result) {
                                if (val == 'up') { 
                                    $scope.voteValue = 1;

                                } else if (val == 'down') {
                                    $scope.voteValue = -1;

                                } else {
                                    $scope.voteValue = 0;
                                }

                                if(typeof($scope.voteTotal) == 'undefined')
                                    $scope.voteTotal = 0;

                                $scope.voteDisplay = $scope.voteTotal + $scope.voteValue;
                            }

                            $scope.isLoading = false;
                        })
                        .error(function (data) {
                            $scope.isLoading = false;
                            $scope.errors = data.errors;
                        });
                };
            }

        };
    });