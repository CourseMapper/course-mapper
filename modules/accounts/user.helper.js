var UserCourses = require('../catalogs/course.controller.js');

var userHelper = {

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

    isUserCreatedCourse: function(error, userId, courseId, success){
        // check if this guy creates this course
        var params2 = {
            createdBy: userId,
            _id: courseId
        };

        var uc = new UserCourses();
        uc.getCourses(
            function(err){
                error(err);
            },

            params2,

            function(doc){
                if(doc.length > 0){
                    success(true);
                } else {
                    success(false);
                }
            }
        );
    }
};

module.exports = userHelper;