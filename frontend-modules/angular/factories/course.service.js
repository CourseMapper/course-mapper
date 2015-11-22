app.factory('courseService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            course: null,

            init: function (courseId, success, error, force) {
                var self = this;

                if (!force && self.course) {
                    if (success)
                        success(self.course);
                }
                else if (force || !self.course)
                    $http.get('/api/course/' + courseId)
                        .success(function (res) {
                            if (res.result) {
                                self.course = res.course;

                                if (success)
                                    success(res.course);
                            }
                        })
                        .error(function (res) {
                            if (error)
                                error(res);
                        });
            },

            isEnrolled: function () {
                if (!this.isInitialized()) return false;

                return this.course.isEnrolled;
            },

            isOwner: function (user) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                return (user._id == self.course.createdBy._id);
            },

            isManager: function (user) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                var mgr = _.find(self.course.managers, {_id: user._id});

                if (mgr) {
                    return true;
                }

                return false;
            },

            leave: function (user, success, error) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                var url = '/api/course/' + self.course._id + '/leave';

                $http.put(url, {})
                    .success(function (res) {
                        if (res.result) {
                            // success leaving
                            self.course.isEnrolled = false;
                        }

                        if (success)
                            success(self.course.isEnrolled);
                    })
                    .error(function (res) {
                        if (error)
                            error(res);
                    });
            },

            enroll: function (user, success, error) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                var url = '/api/course/' + self.course._id + '/enroll';

                $http.put(url, {})
                    .success(function (res) {
                        if (res.result)
                            self.course.isEnrolled = true;

                        if (success)
                            success(self.course.isEnrolled);
                    })
                    .error(function (res) {
                        if (error)
                            error(res);
                    });
            },

            isInitialized: function () {
                if (!this.course) {
                    return false;
                }

                return true;
            }
        }
    }
]);