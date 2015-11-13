var appRoot = require('app-root-path');
var Courses = require(appRoot + '/modules/catalogs/courses.js');

var userHelper = {

    /**
     *
     * @param error
     * @param userId
     * @param courseId
     * @param success
     */
    isUserEnrolled: function (error, userId, courseId, success) {
        var params = {
            course: courseId,
            user: userId
        };

        Courses.find(
            params,

            function (err, doc) {
                if (err)
                    error();
                else if (doc.length > 0) {
                    success(true);
                } else {
                    userHelper.isUserCreatedCourse(error, userId, courseId, success);
                }
            });
    },

    /**
     * check if this userId is the creator of this courseId
     * @param error
     * @param userId
     * @param courseId
     * @param success
     */
    isUserCreatedCourse: function (error, userId, courseId, success) {
        var params = {
            createdBy: userId,
            _id: courseId
        };

        Courses.find(params, function (err, docs) {
            if (!err) {
                if (docs.length > 0) {
                    success(true);
                } else {
                    success(false);
                }
            } else {
                error(err);
            }
        });
    },

    isManager: function (error, userId, courseId, success) {
        var params = {
            _id: courseId,
            managers: userId
        };

        Courses.find(
            params,

            function (err, doc) {
                if (err)
                    error();
                else {
                    if (doc.length > 0) {
                        success(true);
                    } else {
                        success(false);
                    }
                }
            }
        );
    },

    isAuthorized: function (error, params, success) {
        if (params.userId && params.courseId) {
            userHelper.isManager(
                error, params.userId, params.courseId,

                function (ret) {
                    // is manager
                    if (ret) {
                        success(true);
                    } else {
                        // check is owner
                        userHelper.isUserCreatedCourse(
                            error, params.userId, params.courseId,

                            function (ret) {
                                // is owner
                                if (ret) {
                                    success(true);
                                }
                                else {
                                    success(false);
                                }
                            }
                        )
                    }
                }
            );
        }
    }
};

module.exports = userHelper;