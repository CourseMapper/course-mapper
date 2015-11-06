var UserCourses = require('../catalogs/course.controller.js');

var userHelper = {
    isUserEnrolled: function(error, userId, courseId, success){
        var uc = new UserCourses();
        var params = {
            course: courseId,
            user: userId
        };

        uc.getUserCourses(
            function(err){
                error(err);
            },

            params,

            function(doc){
                if(doc.length > 0){
                    success(true);
                } else
                    success(false);
            });
    }
};

module.exports = userHelper;