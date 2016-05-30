var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var Tag = require('./courseTags.js');
var UserCourses = require('./userCourses.js');
var Users = require('../accounts/users.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var TagController = require('./tag.controller.js');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function catalog() {
}

catalog.prototype.getCourse = function (error, params, success) {
    Course.findOne(params)
        .populate('category courseTags')
        .populate('createdBy', '_id username displayName')
        .populate('managers', '_id username')

        .exec(function (err, doc) {
            if (err) {
                error(err);
            } else {
                if (doc) {
                    success(doc);
                }
                else
                    error(helper.createError404('Course'));
            }
        });
};

catalog.prototype.getCourseAsync = function (params) {
    return async(function () {
        var crs = await(Course.findOne(params)
            .populate('category courseTags')
            .populate('createdBy', '_id username displayName')
            .populate('managers', '_id username')
            .exec()
        );

        return crs;
    });
};

/**
 * to add a manager, we are allowing user to find another user.
 * this method will do the check whether the username exist or not.
 *
 * checkUsername, parameter:
 * courseId, we will only course owner to do the check
 * @params: {userId, courseId}
 */
catalog.prototype.checkUsername = function (error, params, success) {
    Course.findOne({
        _id: params.courseId
    }, function (err, doc) {
        if (err) {
            error(err);
        } else if (doc) {
            // this is an owner of a course,
            Users.findOne({
                username: params.username
            }, function (err, usr) {
                if (err) {
                    error(err);
                } else if (usr) {
                    if (usr.id == params.userId.toString()) {
                        error(helper.createError('You are the owner of this course', 404));
                    }
                    else
                        success(
                            {
                                _id: usr._id,
                                username: usr.username
                            }
                        );
                } else {
                    error(helper.createError404('User'));
                }
            })
        }
        else {
            error(helper.createError('Not an owner', 401));
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
        !helper.checkRequiredParams(userParam, ['id'], error) && !helper.checkRequiredParams(courseParam, ['id'], error)
    ) {
        return;
    }

    var userId = userParam.id;
    var courseId = courseParam.id;

    var job = async(function () {
        var usc = await(UserCourses.findOne({
            user: userId,
            course: courseId
        }). exec());

        if (usc) {
            usc.isEnrolled = isEnrolled;
            await(usc.save());
        } else {
            var usc = new UserCourses({
                user: userId,
                course: courseId,
                isEnrolled: isEnrolled
            });

            await(usc.save());
        }

        return usc;
    });

    job().then(function (doc) {
            Plugin.doAction('onAfterEnrollorLeaveCourse', doc);
            done(doc);
        })
        .catch(function (err) {
            // perhaps this user is already enrolled
            error(err)
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
        description: params.description,
        smallDescription: params.smallDescription,
        totalEnrollment: 0
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
                    Plugin.doAction('onAfterCourseCreated', crs);
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

    if (!helper.checkRequiredParams(params, ['courseId', 'name', 'userId'], error)) {
        return;
    }

    function saveEditCourse(course) {
        course.name = params.name;
        course.setSlug(course.name);
        course.description = params.description;
        course.smallDescription = params.smallDescription;
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
        Plugin.doAction('onAfterCourseEdited', course, params);
    }

    self.getCourse(error,
        {
            _id: params.courseId
        },

        function (course) {

            userHelper.isCourseAuthorizedAsync({
                    userId: params.userId,
                    courseId: params.courseId
                })

                .then(function (isAllwd) {

                    if (isAllwd) {
                        if (params.video && params.video == 'delete') {
                            course.video = undefined;
                            course.save(function () {
                                success(course);
                            });
                        } else if (params.picture && params.picture == 'delete') {
                            course.picture = undefined;
                            course.save(function () {
                                success(course);
                            });
                        } else {
                            saveEditCourse(course);
                        }
                    } else {
                        error(helper.createError401());
                    }

                })
                .catch(function () {
                    error(helper.createError401());
                });
        }
    );
};

catalog.prototype.saveSettings = function (params) {
    if (!helper.checkRequiredParams(params, ['courseId', 'userId'], function (err) {
            helper.resReturn(err, res);
        })) {
        return false;
    }

    var courseFnParams = {
        _id: params.courseId
    };

    var course = await(Course.findOne(courseFnParams).exec());
    if (course) {
        var updt = {};
        if (params.managers.length == 0) {
            updt.managers = []
        } else {
            // find usernames and add one by one
            for (var i in params.managers) {
                // dont insert our own uid
                if (params.managers[i] != params.userId.toString()) {
                    params.managers[i] = mongoose.Types.ObjectId(params.managers[i]);
                }
            }
            updt.managers = params.managers;
        }

        if (params.settings) {
            updt.settings = params.settings;
        }

        if (params.tabsActive) {
            updt.tabsActive = params.tabsActive;
        }

        var retQ = await(course.update({
            $set: updt
        }).exec());

        Plugin.doAction('onAfterCourseSettingSaved', course);

        return retQ;

    } else {
        return false;
    }
};

catalog.prototype.getCourses = function (error, params, pageParams, success) {

    if (!pageParams.lastPage || pageParams.lastPage == 'false') {
        pageParams.lastPage = 0;
    }

    var sortOption = {};
    sortOption[pageParams.sortBy] = pageParams.orderBy;

    Course
        .find(params)
        .sort(sortOption)
        .skip(pageParams.lastPage)
        .limit(pageParams.limit)
        .exec(function (err, docs) {
            if (!err) {
                success(docs);
            } else {
                error(err);
            }
        });
};

/**
 *
 * @param error
 * @param params {user:ObjectId, course:ObjectId}
 * @param done
 */
catalog.prototype.getUserCourses = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['user'], error)) {
        return;
    }

    UserCourses.find(params).populate('course').exec(function (err, res) {
        if (err) error(err);
        else
            done(res);
    });
};

catalog.prototype.getCreatedCourses = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['userId'], error)) {
        return;
    }

    Course.find({createdBy: params.userId}).exec(function (err, res) {
        if (err) error(err);
        else
            done(res);
    });
};


catalog.prototype.delete = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    Course.findOne({_id: params.courseId}).exec(function (err, doc) {
        if (err) error(err);
        else if (doc) {
            if (doc.createdBy.equals(mongoose.Types.ObjectId(params.user._id)) || params.user.role == 'admin') {
                doc.isDeleted = true;
                doc.save(function () {
                    done();
                });
            }
        }
    });
};

module.exports = catalog;