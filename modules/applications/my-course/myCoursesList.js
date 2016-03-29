var config = require('config');
var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses.js');
var Resources = require('../../trees/resources.js');
var Newsfeed = require('../newsfeed/models/newsfeed.model.js');
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

    UserCourses.find(params).populate('course', '-description').exec(function (err, res) {
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

//get all breakdown material resources from enrolled courses
enrolledCourses.prototype.getEnrolledResources = function (error, params, done){
    if (!helper.checkRequiredParams(params, ['user'], error)) {
        return;
    }

    var self = this;
    params.isEnrolled = true;
    UserCourses
        .find(params).exec(function (err, res){
            if (err) error (err);
            else
                var cIds = res.map(function(doc){return doc.course});
                Resources.find({ courseId: {$in:cIds}, isDeleted:false }).populate('treeNodeId').exec(function (error, docs){
                    if (error) error (error);
                    else {
                        done (docs);
                    }
                });
                //done(res);
            //done (cIds);
        });
};

//get created course for a user from courses
enrolledCourses.prototype.getCreatedCourses = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['user'], error)) {
        return;
    }

    var pf = {createdBy: params.user};

    Courses.find(pf).select('-description').exec(function (err, res){
       if (err) error (err);
       else
           done(res);
    });
};

//get all breakdown material resources from Created courses
enrolledCourses.prototype.getCreatedResources = function (error, params, done){
    if (!helper.checkRequiredParams(params, ['user'], error)) {
        return;
    }

    var pf = {createdBy: params.user};
    Courses.find(pf).exec(function (err, res){
        if (err) error (err);
        else
            var cIds = res.map(function(doc){return doc.id});
            Resources.find ({courseId: {$in:cIds}, isDeleted:false}).populate('treeNodeId').exec(function (error, docs){
                if (error) error (error);
                else {
                    done (docs);
                }
            })
    });

};

//get all user activity history from newsfeed
enrolledCourses.prototype.getUserNewsfeed = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['user'], error)) {
        return;
    }

    var usrId = {userId: params.user};

    Newsfeed.find(usrId).exec(function (err, res){
        if (err) error (err);
        else done(res);
    });
};


module.exports = enrolledCourses;