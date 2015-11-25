var Posts = require('../discussion/models/posts.js');
var Links = require('./models/links.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');


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

    Links.find({
            contentNode: nodeId,
            isDeleted: false
        })
        .sort({dateAdded: -1})
        .skip(pageParams.lastPage)
        .limit(pageParams.limit)
        .populate('link')
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
        .populate('link')
        .populate('createdBy', 'username displayName')
        .exec(function (err, doc) {
            if (err) {
                error(err);
            } else {
                if (!doc) {
                    helper.createError404('Course')
                } else {
                    success(doc);
                }
            }
        });
};

NodeLinks.prototype.editPost = function (error, params, success) {
    Posts.findOneAndUpdate(
        {
            _id: params.linkId
        },
        {
            $set: {
                title: params.title,
                content: params.content
            }
        },
        {safe: true, upsert: true},
        function (err, doc) {
            if (err)
                error(err);
            else
                success(doc);
        });
};

NodeLinks.prototype.deletePost = function (error, params, success) {
    Posts.update(
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
                if (params.nodeId) {
                    Links.update({
                            link: params.linkId
                        },
                        {
                            $set: {
                                isDeleted: true
                            }
                        },
                        function () {
                            success(doc);
                        });
                }
                else
                    success(doc);
            }
        });
};

NodeLinks.prototype.addPost = function (error, params, success) {
    var self = this;

    var newPost = new Posts({
        title: params.title,
        content: params.content,
        createdBy: params.createdBy,
        isDeleted: false
    });

    newPost.setSlug(params.title);
    newPost.save(function (err) {
        if (err) {
            error(err);
            return;
        }

        // set parent and parentsPath
        {
            if (params.parentPost) {
                newPost.parentPost = params.parentPost;
                newPost.save();

                // put this guy as its child
                Posts.findOne({_id: params.parentPost}, function (err, doc) {
                    if (!err) {
                        if (doc) doc.childPosts.push(newPost._id);
                    }
                });
            }

            if (params.parentPath) {
                newPost.parentPath = params.parentPath;
                newPost.save();
            }
        }

        // make a relation to NodeLinks
        if (params.nodeId) {
            var cd = new Links({
                contentNode: params.nodeId,
                createdBy: params.createdBy,
                link: newPost._id,
                isDeleted: false
            });

            cd.save(function (err) {
                if (!err) {
                    //cd.link = newPost;
                    self.getNodeLink(error, cd._id, function (b) {
                        success(b);
                    });
                } else error(err);
            });

        } else {
            // there is no course id, maybe its a reply
            success(newPost);
        }
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
        Links.findOne({link: params.linkId})
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
        link: params.linkId,
        createdBy: params.userId
    }).exec());

    if (po)
        return true;

    return false;
});

module.exports = NodeLinks;