var Links = require('./models/links.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function NodeLinks() {
}

/**
 * find root posts based on params,
 * populate all of its child posts
 *
 * @param error
 * @param params
 * @param success
 */
NodeLinks.prototype.getNodeLinks = function (error, nodeId, pageParams, success) {
    if (!nodeId)
        return error(helper.createError(msg, 400));

    if (!pageParams.lastPage || pageParams.lastPage == 'false') {
        pageParams.lastPage = 0;
    }

    var sortOption = {};
    sortOption[pageParams.sortBy] = pageParams.orderBy;

    Links.find({
            contentNode: nodeId,
            isDeleted: false
        })
        .sort(sortOption)
        .skip(pageParams.lastPage)
        .limit(pageParams.limit)
        .populate('createdBy', 'username displayName')
        .exec(function (err, docs) {
            if (err) {
                error(err);
            } else {
                success(docs);
            }
        });
};

NodeLinks.prototype.getNodeLink = function (error, pId, success) {
    if (!pId)
        return error(helper.createError(msg, 400));

    Links.findOne({
            _id: pId
        })
        .sort({dateAdded: -1})
        .populate('createdBy', 'username displayName')
        .exec(function (err, doc) {
            if (err) {
                error(err);
            } else {
                if (!doc) {
                    helper.createError404('Link')
                } else {
                    success(doc);
                }
            }
        });
};

NodeLinks.prototype.editPost = function (error, params, user, success) {
    Links.findOneAndUpdate(
        {
            _id: params.linkId
        },
        {
            $set: {
                title: params.title,
                content: params.content,
                description: params.description
            }
        },
        {safe: true, upsert: true},
        function (err, doc) {
            if (err)
                error(err);
            else {
                Plugin.doAction('onAfterLinkEdited', params, user);
                success(doc);
            }
        });
};

NodeLinks.prototype.deletePost = function (error, params, user, success) {
    Links.update(
        {
            _id: params.linkId
        },
        {
            $set: {
                isDeleted: true
            }
        },
        function (err, doc) {
            if (err)
                error(err);
            else {
                Plugin.doAction('onAfterLinkDeleted', params, user);
                success(doc);
            }
        });
};

NodeLinks.prototype.addPost = function (error, params, success) {
    var self = this;

    var newPost = new Links({
        title: params.title,
        content: params.content,
        createdBy: params.createdBy,
        description: params.description,
        isDeleted: false,
        contentNode: params.nodeId
    });

    newPost.setSlug(params.title);
    newPost.save(function (err) {
        if (err) {
            error(err);
            return;
        }

        success(newPost);
    });
};


/**
 * check for enrollement, manager and admin always enrolled
 *
 * @param params {postId:objectId, userId:objectId}
 */
NodeLinks.prototype.isLinkEnrolled = async(function (params) {
    // maybe it is a main post
    var findCourse = await(
        Links.findOne({_id: params.linkId})
            .populate('contentNode')
            .exec()
    );

    if (findCourse && findCourse.contentNode && findCourse.contentNode.courseId) {
        var isAllowd = await(userHelper.isEnrolledAsync({
            userId: params.userId,
            courseId: findCourse.contentNode.courseId
        }));
        if (isAllowd)
            return isAllowd;
    }

    return false;
});

/**
 * check for permission, manager, admin, post owner
 * @param params {userId: objectId, postId: objectId}
 */
NodeLinks.prototype.isLinkAuthorized = async(function (params) {
    // check for admin and manager and crs owner or post owner
    var isAllowd = await(this.isLinkOwner(params));
    if (isAllowd) return true;

    // maybe it is a discussion post
    var findCourse = await(
        Links.findOne({_id: params.linkId})
            .populate('contentNode')
            .exec()
    );

    if (findCourse && findCourse.contentNode && findCourse.contentNode.courseId) {
        isAllowd = await(userHelper.isCourseAuthorizedAsync({
            userId: params.userId, courseId: findCourse.contentNode.courseId
        }));

        if (isAllowd) return true;
    }

    return false;
});

/**
 * check is this user a post owner
 * @param params {userId: objectId, postId: objectId}
 */
NodeLinks.prototype.isLinkOwner = async(function (params) {
    var po = await(Links.findOne({
        _id: params.linkId,
        createdBy: params.userId
    }).exec());

    if (po)
        return true;

    return false;
});

module.exports = NodeLinks;