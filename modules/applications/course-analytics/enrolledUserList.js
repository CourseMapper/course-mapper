var config = require('config');
var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
//var _ = require('underscore');

function enrolledUserList() {
}

//get enrolled course from userCourses  and call createdCourses for a user
enrolledUserList.prototype.getUserList = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['course'], error)) {
        return;
    }

    //var self = this;

    params.course = mongoose.Types.ObjectId(params.course);
    params.isEnrolled = true;

    UserCourses.find(params).populate('user', 'username displayName image').sort({dateUpdated: -1}).exec(function (err, res) {
        if (err) error(err);
        else {
            done(res);

        }

    });
};




module.exports = enrolledUserList;