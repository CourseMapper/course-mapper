var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var Tag = require('./courseTags.js');
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
 */
catalog.prototype.enroll = function(err, userParam, courseParam, done){
    var user = null;
    var course = null;

    /* find user first see if it exist */
    var userPromise = User.findById(mongoose.Types.ObjectId(userParam.id)).exec();
    userPromise.then(function(u){
        user = u;
        //{shortId:courseParam.shortId}
        return Course.findOne(courseParam).exec();

    }).then(function(c){
        /* find course see if it exist */
        course = c;
        return UserCourse.find({userId: user._id, courseId: course._id}).exec();

    }).then(function(uc){
        /* user has not follow this course */
        if(!uc.length){
            var follow = new UserCourse({
                userId: user._id,
                courseId: course._id
            });

            follow.save(function(error, f){
                if (error) err(error);
                else done(f);
            });
        } else {
            err(new Error('This user has followed this course already'));
        }
    });
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

module.exports = catalog;