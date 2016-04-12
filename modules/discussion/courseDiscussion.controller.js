var config = require('config');
var Posts = require('./models/posts.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function courseDiscussion() {
}

function convertToDictionary(documents) {
    var ret = {};
    for (var i in documents) {
        var doc = documents[i];
        ret[doc._id] = doc.toObject({getters: true, virtuals: false});
    }

    return ret;
}

/**
 * find root posts based on params,
 * populate all of its child posts
 *
 * @param error
 * @param params
 * @param success
 */
courseDiscussion.prototype.getCourseDiscussions = function (error, courseId, pageParams, success) {
    var whereParams = {
        course: courseId,
        isDeleted: false
    };

    if (!pageParams.lastPage || pageParams.lastPage == 'false') {
        pageParams.lastPage = 0;
    }

    var sortOption = {};
    sortOption[pageParams.sortBy] = pageParams.orderBy;

    Posts.find(whereParams)
        .sort(sortOption)
        .skip(pageParams.lastPage)
        .limit(pageParams.limit)
        .populate('createdBy', 'username displayName image')
        .exec(function (err, docs) {
            if (!err) {
                success(docs);
            } else {
                error(err);
            }
        });
};

courseDiscussion.prototype.getDiscussion = function (error, pId, success) {
    Posts.findOne({
            _id: pId
        })
        .sort({dateAdded: -1})
        .populate('createdBy', 'username displayName image')
        .exec(function (err, docs) {
            if (!err) {
                success(docs);
            } else {
                error(err);
            }
        });
};

/**
 * get all categories based on params,
 * and form the data into recursive tree
 *
 * @param error
 * @param params
 * @param success
 */
courseDiscussion.prototype.getReplies = function (error, parentId, pageParams, success) {

    var sortOption = {};
    sortOption[pageParams.sortBy] = pageParams.orderBy;

    Posts.find({
            $or: [
                {parentPost: parentId}
            ],
            $and: [
                {isDeleted: false}
            ]
        })
        .sort(sortOption)
        .populate('createdBy', 'username displayName image')
        .exec(function (err, docs) {
            if (!err) {
                var cats = convertToDictionary(docs);

                var parent = 'parentPost';
                var children = 'childPosts';

                var tree = [];

                function again(cat) {
                    if (cat[children]) {
                        var childrens = [];
                        for (var e in cat[children]) {
                            var catId = cat[children][e];
                            var childCat = cats[catId];
                            childrens.push(childCat);
                            again(childCat);
                        }

                        cat[children] = childrens;
                    }
                }

                for (var i in cats) {
                    var doc = cats[i];
                    again(doc);
                    tree.push(doc);
                }

                success(tree);
            } else {
                error(err);
            }
        });
};

courseDiscussion.prototype.editPost = function (error, params, user, success) {
    Posts.findOne({
        _id: params.postId
    }).exec(function (err, doc) {
        if (err) {
            error(err);

        } else if (doc) {
            doc.title = params.title;
            doc.content = params.content;
            doc.save(function () {
                Plugin.doAction('onAfterDiscussionEdited', doc, user);
                success(doc);
            });

        } else {
            error(helper.createError404('Post'));
        }
    });

};

courseDiscussion.prototype.deletePost = function (error, params, user, success) {
    Posts.update(
        {
            _id: params.postId
        },
        {
            $set: {
                isDeleted: true,
                dateDeleted: new Date()
            }
        },
        function (err, doc) {
            if (err)
                error(err);
            else {
                Plugin.doAction('onAfterDiscussionDeleted', params, user);
                success(doc);
            }
        });
};

courseDiscussion.prototype.addPost = function (error, params, success) {
    var self = this;

    var newPost = new Posts({
        title: params.title,
        content: params.content,
        createdBy: params.createdBy,
        isDeleted: false
    });

    if (params.courseId) {
        newPost.course = params.courseId;
    }

    newPost.setSlug(params.title);
    newPost.save(function (err) {
        if (err) {
            error(err);
            return;
        }

        // set parent and parentsPath
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

        // set parent path
        if (params.parentPath) {
            newPost.parentPath = params.parentPath;
            newPost.save();
        }

        self.getDiscussion(error, newPost._id, function (b) {
            Plugin.doAction('onAfterDiscussionCreated', b);
            success(b);
        });
    });
};

/**
 * check for enrollement, manager and admin always enrolled
 *
 * @param params {postId:objectId, userId:objectId}
 */
courseDiscussion.prototype.isPostEnrolled = async(function (params) {
    // find post detail
    var rep = await(Posts.findOne({_id: params.postId})
        .populate('parentPost')
        .exec());

    var cid = false;
    if (rep && rep.parentPost && rep.parentPost.course) {
        cid = rep.parentPost.course
    }
    else if (rep && rep.course) {
        cid = rep.course;
    }

    if (cid) {
        var isAllowd = await(userHelper.isEnrolledAsync({
            userId: params.userId,
            courseId: cid
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
courseDiscussion.prototype.isPostAuthorized = async(function (params) {
    // check for admin and manager and crs owner or post owner
    var isAllowd = await(this.isPostOwner(params));
    if (isAllowd) return true;

    // look for post detail
    var rep = await(Posts.findOne({_id: params.postId})
        .populate('parentPost')
        .exec());

    var cid = false;
    if (rep && rep.parentPost && rep.parentPost.course) {
        cid = rep.parentPost.course;
    }
    else if (rep && rep.course) {
        cid = rep.course;
    }

    if (cid) {
        isAllowd = await(userHelper.isCourseAuthorizedAsync({
            userId: params.userId, courseId: cid
        }));

        if (isAllowd)
            return true;
    }

    return false;
});

/**
 * check is this user a post owner
 * @param params {userId: objectId, postId: objectId}
 */
courseDiscussion.prototype.isPostOwner = async(function (params) {
    var po = await(Posts.findOne({
        _id: params.postId,
        createdBy: params.userId
    }).exec());

    if (po)
        return true;

    return false;
});

module.exports = courseDiscussion;