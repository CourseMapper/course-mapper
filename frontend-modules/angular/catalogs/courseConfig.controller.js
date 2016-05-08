app.controller('CourseConfigController', function ($scope, $http, toastr, $window, $timeout) {
    $scope.courseEdit = null;
    $scope.errors = [];
    $scope.managersRaw = [];
    $scope.managersIdRaw = [];
    $scope.username = '';
    $scope.isLoading = false;
    $scope.tabsActive = {};
    $scope.settings = {
        disableControls: false,
        disableTop: false
    };

    $scope.$on('onAfterInitCourse', function (event, course) {
        $scope.init(course);
    });

    $scope.init = function (course) {
        if (!course)
            return;

        $scope.managersRaw = [];

        $('#usernameSearchBox').on('keydown', function (event) {
            var x = event.which;
            if (x === 13) {
                event.preventDefault();
                $scope.findUsername();
            }
        });

        $scope.courseEdit = cloneSimpleObject(course);

        $('#managerTagForm input').attr('readonly', 'readonly');

        if ($scope.courseEdit) {
            if ($scope.courseEdit.managers && $scope.courseEdit.managers.length > 0) {
                for (var i in $scope.courseEdit.managers) {
                    var t = $scope.courseEdit.managers[i];
                    $scope.managersRaw.push({"text": t.username, "_id": t._id});
                }
            }
        }
    };

    $scope.findUsername = function () {
        $scope.errors = [];

        if ($scope.username.trim() != '') {
            $scope.isLoading = true;
            $http.get('/api/course/' + $scope.courseEdit._id + '/checkUsername/' + $scope.username)
                .success(function (res) {
                    if (res.result) {
                        if (res.user.username == $scope.username) {
                            if (!_.find($scope.managersRaw, {'text': $scope.username}, 'text')) {
                                $scope.managersRaw.push({"text": res.user.username, '_id': res.user._id});
                            }
                        }
                    }

                    $scope.username = '';
                    $scope.isLoading = false;
                })
                .error(function (res) {
                    $scope.errors = res.errors;
                    $scope.isLoading = false;
                });
        }
    };

    $scope.saveCourseSetting = function (isValid) {
        if (!isValid)
            return;

        $scope.managersIdRaw = [];

        var url = '/api/course/' + $scope.courseEdit._id + '/settings';
        $scope.managersIdRaw = [];
        if ($scope.managersRaw.length > 0) {
            for (var i in $scope.managersRaw) {
                $scope.managersIdRaw.push($scope.managersRaw[i]._id);
            }
        }

        var params = {
            managers: JSON.stringify($scope.managersIdRaw)
        };

        if ($scope.tabsActive) {
            params.tabsActive = $scope.tabsActive;
        }
        if ($scope.settings) {
            params.settings = $scope.settings;
        }

        $scope.isLoading = true;
        $http.put(url, params)
            .success(function (res) {
                if (res.result) {
                    toastr.success('Successfully Saved');
                }

                $scope.managersIdRaw = [];

                $scope.isLoading = false;
                $('#configView').modal('hide');
                $scope.errors = [];

                $window.location.reload();
            })
            .error(function (res) {
                $scope.errors = res.errors;
                $scope.isLoading = false;
            });
    };

    $scope.removeUsername = function ($tag) {
        console.log('removed ' + JSON.stringify($tag));
    };

    $scope.cancel = function () {
        $scope.courseEdit = cloneSimpleObject($scope.$parent.course);
    };

    $scope.deleteCourse = function () {
        if (confirm('Are you sure you want to delete this course?')) {
            $http.delete('/api/course/' + $scope.courseId)
                .success(function (data) {
                    if (data.result) {
                        toastr.success('Successfully deleted');

                        $timeout(function () {
                            $('#configView').modal('hide');
                            $('.content-course').css('display', 'none');
                            $('.action-header').css('visibility', 'hidden');
                            $scope.$parent.isDeleted = true;
                        });
                    }
                })
                .error(function (data) {
                    $scope.errors = data.errors;
                });
        }
    };
});
