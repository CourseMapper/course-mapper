var config = require('config');
var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
//var _ = require('underscore');

function enrolledCourses() {

}

//get enrolled course from userCourses  and call createdCourses for a user
enrolledCourses.prototype.getEnrolledCourses = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['user'], error)) {
        return;
    }

    var self = this;

    //params.user = mongoose.Types.ObjectId(params.user);
    params.isEnrolled = true;

    UserCourses.find(params).populate('course').exec(function (err, res) {
        if (err) error(err);
        else {

            self.getCreatedCourses(error, params, function (docs){
                done(
                    {
                        created: docs,
                        enrolled:res
                    } )
            });

        }

    });
};

//get created course for a user from courses
enrolledCourses.prototype.getCreatedCourses = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['user'], error)) {
        return;
    }

    var pf = {createdBy: params.user};

    Courses.find(pf).exec(function (err, res){
       if (err) error (err);
       else
           done(res);
    });
};

module.exports = enrolledCourses;