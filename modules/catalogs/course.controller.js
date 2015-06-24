var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var Tag = require('./courseTags.js');
var UserCourses = require('./userCourses.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var TagController = require('./tag.controller.js');

function catalog(){
}

catalog.prototype.getCourse = function(error, params, success){
    Course.findOne(params)
        .populate('createdBy category courseTags').exec(function(err, docs) {
            if (!err){
                success(docs);
            } else {
                error(err);
            }
        });
};

/**
 *
 * @param err
 * @param userParam
 * @param courseParam
 * @param done
 * @param isEnrolled, if false, means that the user has left t
 */
catalog.prototype.enroll = function(error, userParam, courseParam, done, isEnrolled){
    var user = null;
    var course = null;

    if(!userParam.id) {
        throw new Error("please give user id parameter");
    }

    if(!courseParam.id) {
        throw new Error("please give course id parameter");
    }

    var userId = mongoose.Types.ObjectId(userParam.id);
    var courseId = mongoose.Types.ObjectId(courseParam.id);

    UserCourses.findOneAndUpdate({
        user: userId,
        course: courseId
    }, {
        user: userId,
        course: courseId,
        isEnrolled: isEnrolled
    },{upsert: true}
    ).exec(function(err, doc){
            if(err){
                // perhaps this user is already enrolled
                error(err)
            } else {
                done(doc);
            }
        });
};

/**
 *
 * @param err
 * @param userParam
 * @param courseParam
 * @param done
 */
catalog.prototype.leave = function(error, userParam, courseParam, done){
    this.enroll(error, userParam, courseParam, done, true);
};

catalog.prototype.addCourse = function(error, params, success){
    var self = this;

    if(!params.category) {
        throw new Error("please give category parameter");
    }

    if(!params.name) {
        throw new Error("please give name parameter");
    }

    var course = new Course({
        name: params.name,
        createdBy: mongoose.Types.ObjectId(params.userId),
        category: mongoose.Types.ObjectId(params.category),
        description: params.description
    });

    course.setSlug(params.name);

    course.save(function(err, res) {
        if (err) {
            debug('failed saving new course');
            error(err);
        }
        else {
            // success saved the course
            // find the newly saved course, and call the success Callback
            self.getCourse(
                error,
                {_id: course._id},
                function(crs){
                    // they giving us the tags in array of slug string.
                    if(params.tagSlugs){
                        // insert all the tags, if it failed, means it is already there

                        var tc = new TagController();
                        // get all the tags, we need the _ids
                        for(var i in params.tagSlugs){
                            var tagParam = {
                                name : params.tagSlugs[i],
                                course : crs._id,
                                category: params.category
                            };

                            tc.addCourseTag(function(err){
                                    if(err) debug(err);
                                },
                                tagParam,
                                function(){});
                        }
                    }

                    success(crs);
                }
            );
        }
    });
};

catalog.prototype.getCourses = function(error, params, success){
    Course.find(params, function(err, docs) {
        if (!err){
            success(docs);
        } else {
            error(err);
        }
    });
};

catalog.prototype.getUserCourses = function(error, params, done){
    UserCourses.find(params).populate('course user').exec(function(err, res){
        if(err) error(err);
        else done(res);
    });
};

module.exports = catalog;