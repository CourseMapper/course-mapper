var appRoot = require('app-root-path');
var Users = require(appRoot + '/modules/accounts/users.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var UserCourses = require(appRoot + '/modules/catalogs/userCourses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var userHelper = {

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

    isAdmin: function (error, userId, success) {
        Users.findOne({
            _id: userId
        }, function (err, doc) {
            if (err)
                error();
            else {
                if (doc && doc.role == 'admin') {
                    success(true);
                } else {
                    success(false);
                }
            }
        });
    },

    isAuthorized: function (error, params, success) {
        userHelper.isCourseAuthorizedAsync(params).then(success).catch(error);
    },

    isAdminAsync: async(function (params) {
        var usr = await(Users.findOne({
            _id: params.userId
        }).exec());

        if (usr && usr.role == 'admin')
            return true;

        return false;
    }),

    isCourseOwnerAsync: async(function (params) {
        var courseOwner = await(Courses.find({
            createdBy: params.userId,
            _id: params.courseId
        }).exec());

        return courseOwner.length > 0;
    }),

    isManagerAsync: async(function (params) {
        var courses = await(Courses.find({
            _id: params.courseId,
            managers: params.userId
        }).exec());

        return courses.length > 0;
    }),

    /**
     * check for admin, manager, and course owner, enrolled student
     */
    isEnrolledAsync: async(function (params) {
        // check admin manager, course owner
        var isAllowd = await(this.isCourseAuthorizedAsync(params));
        if (isAllowd)
            return true;

        // enrolled student
        var ret = await(UserCourses.find({
            course: params.courseId,
            user: params.userId
        }).exec());
        if (ret.length > 0) {
            return true;
        }

        return false;
    }),

    /**
     * to check whether this user is admin, manager, or course owner
     */
    isCourseAuthorizedAsync: async(function (params) {
        var isManager = await(this.isManagerAsync(params));
        var isCourseOwner = await(this.isCourseOwnerAsync(params));
        var isAdmin = await(this.isAdminAsync(params));

        return (isAdmin || isCourseOwner || isManager);
    })
};

module.exports = userHelper;