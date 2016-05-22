var config = require('config');
var Rubric = require('./models/rubric.js');
var users = require('../accounts/users.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');
var fs = require('fs-extra');

function rubrics() {

}

rubrics.prototype.addRubric = function (error, params, success) {

    if (!helper.checkRequiredParams(params, ['courseId', 'userId', 'title', 'description'], error)) {
        return;
    }

    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        function (isAllowed) {
            if (isAllowed) {

                var rubric = new Rubric({
                    title: params.title,
                    createdBy: mongoose.Types.ObjectId(params.userId),
                    courseId: mongoose.Types.ObjectId(params.courseId),
                    description: params.description,
                });

                rubric.save(function (err, res) {
                    if (err) {
                        debug('error saving rubric');
                        error(err);
                    }
                    else {
                        debug('rubric saved successfully');
                        success();
                    }
                });

            } else {
                error(helper.createError401());
            }
        });
}

rubrics.prototype.updateRubric = function (error, params, success) {
    var self = this

    if (!helper.checkRequiredParams(params, ['courseId', 'userId', 'rId'], error)) {
        return;
    }

    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        function (isAllowed) {
            if (isAllowed) {

                self.getRubric(error, {
                    _id: params.rId
                }, function(rubric) {
                    rubric.title = params.title
                    rubric.description = params.description

                    rubric.save(function (err, res) {
                        if (err) {
                            debug('error saving rubric');
                            error(err);
                        }
                        else {
                            debug('rubric saved successfully');
                            success();
                        }
                    });
                })
            } else {
                error(helper.createError401());
            }
        });
}

rubrics.prototype.getRubric = function(error, params, success) {
    Rubric.findOne(params)
        .exec(function (err, doc) {
            if (err) {
                error(err);
            } else {
                if (doc) {
                    success(doc);
                }
                else
                    error(helper.createError404('Rubric'));
            }
        });
}

rubrics.prototype.getRubrics = function (error, params, success) {
    Rubric.find(params).sort({dateAdded: -1}).exec(function(err, docs) {
        if(!err) {
            success(docs);
        } else {
            error(err);
        }
    })
}

rubrics.prototype.deleteRubric = function (error, params, success) {
    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },
        function (isAllowed) {
            if (isAllowed) {
                Rubric.remove(
                    {_id: params.rId }
                ).exec(function(err, res){
                    if(!err) {
                        success();
                    } else {
                        error(err);
                    }
                })
            } else {
                error(helper.createError401());
            }
        }
    )
}

module.exports = rubrics;