var UserCourses = require('../catalogs/course.controller.js');
var Courses = require('../catalogs/courses.js');

var userHelper = {

    /**
     *
     * @param error
     * @param userId
     * @param courseId
     * @param success
     */
    isUserEnrolled: function(error, userId, courseId, success){
        var params = {
            course: courseId,
            user: userId
        };

        var uc = new UserCourses();
        uc.getUserCourses(
            function(err){
                error(err);
            },

            params,

            function(doc){
                if(doc.length > 0){
                    success(true);
                } else{
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
    isUserCreatedCourse: function(error, userId, courseId, success){
        var params = {
            createdBy: userId,
            _id: courseId
        };

        var uc = new UserCourses();
        uc.getCourses(
            function(err){
                error(err);
            },

            params,

            function(doc){
                if(doc.length > 0){
                    success(true);
                } else {
                    success(false);
                }
            }
        );
    },

    isManager: function(error, userId, courseId, success){
        var params = {
            _id: courseId,
            managers: userId
        };

        Courses.find(

            params,

            function(err, doc){
                if(err)
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

    isAuthorized: function(error, params, success){
        if(params.userId && params.courseId){
            userHelper.isManager(
                error, params.userId, params.courseId,

                function(ret){
                    // is manager
                    if(ret){
                        success(true);
                    } else {
                        // check is owner
                        userHelper.isUserCreatedCourse(
                            error, params.userId, params.courseId,

                            function(ret){
                                // is owner
                                if(ret) {
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