app.directive('voting',
    function () {
        return {
            restrict: 'E',

            scope: {
                voteType: '@',
                voteTypeId: '@',
                voteValue: '@',
                voteTotal: '@',
                voteDisplay: '@',
                mode: '@'
            },

            templateUrl: function (elem, attrs) {
                var mode = 'vertical';
                if (attrs['mode'])
                    mode = attrs['mode'];

                var tmplt = '/partials/vote-' + mode + '.html';

                return tmplt;
            },

            controller: function ($scope, $compile, $http, $attrs, toastr) {
                $scope.errors = [];

                if ($attrs.voteTotal)
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
                        .success(function (data) {
                            if (data.result && data.vote.length > 0) {
                                $scope.voteTotal = data.vote[0].total;
                                $scope.voteDisplay = data.vote[0].total;

                                if (data.vote[0].isVotingObject) {
                                    $scope.voteValue = data.vote[0].isVotingObject.voteValue;
                                    if ($scope.voteValue == 1)
                                        $scope.voteTotal -= 1;
                                    else if ($scope.voteValue == -1)
                                        $scope.voteTotal += 1;

                                    $scope.voteDisplay = $scope.voteTotal + $scope.voteValue;
                                }
                            }
                            $scope.isLoading = false;
                        })
                        .error(function (data) {
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
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    })
                        .success(function (data) {
                            if (data.result) {
                                if (val == 'up') {
                                    $scope.voteValue = 1;

                                } else if (val == 'down') {
                                    $scope.voteValue = -1;

                                } else {
                                    $scope.voteValue = 0;
                                }

                                if (typeof($scope.voteTotal) == 'undefined')
                                    $scope.voteTotal = 0;

                                if (val == 'reset') {
                                    toastr.success('Vote Removed');
                                }
                                else {
                                    toastr.success('Successfully Voted');
                                }

                                $scope.voteDisplay = $scope.voteTotal + $scope.voteValue;
                            }

                            $scope.isLoading = false;
                        })
                        .error(function (data) {
                            $scope.isLoading = false;
                            $scope.errors = data.errors;

                            toastr.error('Voting Failed');
                        });
                };
            }

        };
    });