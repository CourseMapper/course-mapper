var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var Tag = require('./courseTags.js');
var UserCourses = require('./userCourses.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var TagController = require('./tag.controller.js');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');

function catalog() {
}

catalog.prototype.getCourse = function (error, params, success) {
    Course.findOne(params)
        .populate('category courseTags').exec(function (err, doc) {
            if (err) {
                error(err);
            } else {
                if (doc)
                    success(doc);
                else
                    helper.createError404('Course');
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
catalog.prototype.enroll = function (error, userParam, courseParam, done, isEnrolled) {
    if (
        !helper.checkRequiredParams(userParam, ['id'], error) &&
        !helper.checkRequiredParams(courseParam, ['id'], error)
    ) {
        return;
    }

    var userId = mongoose.Types.ObjectId(userParam.id);
    var courseId = mongoose.Types.ObjectId(courseParam.id);

    UserCourses.findOneAndUpdate({
            user: userId,
            course: courseId
        },
        {
            user: userId,
            course: courseId,
            isEnrolled: isEnrolled
        },
        {upsert: true}
    ).exec(function (err, doc) {
            if (err) {
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
catalog.prototype.leave = function (error, userParam, courseParam, done) {
    this.enroll(error, userParam, courseParam, done, false);
};

catalog.prototype.addCourse = function (error, params, success) {
    var self = this;

    if (!helper.checkRequiredParams(params, ['category', 'name', 'userId'], error)) {
        return;
    }

    var course = new Course({
        name: params.name,
        createdBy: mongoose.Types.ObjectId(params.userId),
        category: mongoose.Types.ObjectId(params.category),
        description: params.description
    });

    course.setSlug(params.name);

    course.save(function (err, res) {
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
                function (crs) {
                    // they giving us the tags in array of slug string.
                    if (params.tagSlugs) {
                        // insert all the tags, if it failed, means it is already there

                        var tc = new TagController();
                        // get all the tags, we need the _ids
                        for (var i in params.tagSlugs) {
                            var tagParam = {
                                name: params.tagSlugs[i],
                                course: crs._id,
                                category: params.category
                            };

                            tc.addCourseTag(function (err) {
                                    if (err) debug(err);
                                },
                                tagParam,
                                function () {
                                });
                        }
                    }

                    success(crs);
                }
            );
        }
    });
};

catalog.prototype.saveResourceFile = function (error, file, newName, success) {
    var filetypePicture = ['jpg', 'png', 'jpeg'];
    var filetypeVideo = ['mp4', 'webm'];

    var extension = file.name.split('.');
    extension = extension[extension.length - 1].toLowerCase();

    if (filetypePicture.indexOf(extension) < 0 &&
        filetypeVideo.indexOf(extension) < 0
    ) {
        // extension not right
        error(new Error("File extension not right"));
    }
    else {

        var fn = '/img/courses/' + newName + '.' + extension;
        var dest = appRoot + '/public' + fn;
        try {
            handleUpload(file, dest, true);

        } catch (ex) {
            error(new Error("Failed uploading"));
            return;
        }

        var ft = "";
        if (filetypePicture.indexOf(extension) >= 0) {
            ft = 'picture';
        } else if (filetypeVideo.indexOf(extension) >= 0) {
            ft = 'video';
        }

        if (success) {
            success(fn, ft);
        }
    }
};

catalog.prototype.editCourse = function (error, params, files, success) {
    var self = this;

    if (!helper.checkRequiredParams(params, ['courseId', 'name'], error)) {
        return;
    }

    self.getCourse(error, {_id: mongoose.Types.ObjectId(params.courseId)},
        function (course) {
            // check for ownership
            var uid = mongoose.Types.ObjectId(params.userId);
            if (course.createdBy.equals(uid)) {
                // this is the owner
                course.name = params.name;
                course.description = params.description;
                course.courseTags = [];

                // save the update
                course.save();

                if (files) {
                    if (files.file && files.file.constructor != Array) {
                        var be = [files.file];
                        files.file = be;
                    }

                    for (var i in files.file) {
                        var f = files.file[i];
                        self.saveResourceFile(
                            error,
                            f,
                            course.id,
                            function (fn, ft) {
                                if (ft == 'picture') {
                                    course.picture = fn;
                                    course.save();
                                } else if (ft == 'video') {
                                    course.video = fn;
                                    course.save();
                                }
                            }
                        );
                    }
                }

                // they giving us the tags in array of slug string.
                if (params.tagSlugs) {
                    // insert all the tags, if it failed, means it is already there
                    var tc = new TagController();
                    // get all the tags, we need the _ids
                    for (var i in params.tagSlugs) {
                        var tagParam = {
                            name: params.tagSlugs[i],
                            course: course._id,
                            category: course.category._id
                        };

                        tc.addCourseTag(function (err) {
                                if (err) debug(err);
                            },
                            tagParam,
                            // we dont need to do anything after, so pass it an empty func
                            function () {
                            });
                    }
                }

                success(course);
            }
            else {
                error(helper.createError('You are not authorized to edit this course', 401));
            }
        }
    );
};

catalog.prototype.getCourses = function (error, params, success) {
    Course.find(params, function (err, docs) {
        if (!err) {
            success(docs);
        } else {
            error(err);
        }
    });
};

catalog.prototype.getUserCourses = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['course', 'user'], error)) {
        return;
    }

    params.course = mongoose.Types.ObjectId(params.course);
    params.user = mongoose.Types.ObjectId(params.user);

    UserCourses.find(params).populate('course').exec(function (err, res) {
        if (err) error(err);
        else
            done(res);
    });
};

module.exports = catalog;