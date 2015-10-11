var config = require('config');
var Posts = require('./models/posts.js');
var Discussion = require('./models/courseDiscussions.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');

function courseDiscussion(){
}

function convertToDictionary(documents){
    var ret = {};
    for(var i in documents){
        var doc = documents[i];
        ret[doc._id] = doc.toObject({ getters: true, virtuals: false });
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
courseDiscussion.prototype.getCourseDiscussions = function(error, courseId, success){
    Discussion.find({
        course: courseId,
        isDeleted: false
    })
        .sort({dateAdded: -1})
        .populate('discussion')
        .populate('createdBy', 'username displayName')
        .exec(function(err, docs) {
            if (!err){
                success(docs);
            } else {
                error(err);
            }
        });
};

courseDiscussion.prototype.getCourseDiscussion = function(error, pId, success){
    Discussion.findOne({
        _id: pId
    })
        .sort({dateAdded: -1})
        .populate('discussion')
        .populate('createdBy', 'username displayName')
        .exec(function(err, docs) {
            if (!err){
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
courseDiscussion.prototype.getReplies = function(error, parentId, success){
    Posts.find({
        $or: [
            { parentPost: parentId }
            //,{ parentPath : { $in: [ discussionId ] }}
        ],
        $and:[
            {isDeleted: false}
        ]
    })
        .sort({dateAdded: -1})
        .populate('createdBy', 'username displayName')
        .exec(function(err, docs) {
        if (!err){
            var cats = convertToDictionary(docs);

            var parent = 'parentPost';
            var children = 'childPosts';

            var tree = [];

            function again(cat){
                if(cat[children]){
                    var childrens = [];
                    for(var e in cat[children]){
                        var catId = cat[children][e];
                        var childCat = cats[catId];
                        childrens.push(childCat);
                        again(childCat);
                    }

                    cat[children] = childrens;
                }
            }

            for(var i in cats){
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

courseDiscussion.prototype.editPost = function(error, params, success){
    Posts.findOne({
        _id: params.postId,
        createdBy: params.userId
    }).exec(function(err, doc){
        if(err){
            error(err);

        } else if(doc){
            doc.title = params.title;
            doc.content = params.content;
            doc.save(function(){
                success(doc);
            });

        } else {
            error(helper.createError404('Post'));
        }
    });

};

courseDiscussion.prototype.deletePost = function(error, params, success){
    Posts.update(
        {
            _id: params.postId,
            createdBy: params.userId
        },
        {
            $set: {
                isDeleted: true,
                dateDeleted: new Date()
            }
        },
        function(err, doc){
            if(err)
                error(err);
            else {
                if(params.courseId){
                    Discussion.update({
                            discussion: params.postId,
                            createdBy: params.userId
                        },
                        {
                            $set: {
                                isDeleted: true,
                                dateDeleted: new Date()
                            }
                        },
                    function(){
                        success(doc);
                    });
                }
                else
                    success(doc);
            }
        });
};

courseDiscussion.prototype.addPost = function(error, params, success){
    var self = this;

    var newPost = new Posts({
        title: params.title,
        content: params.content,
        createdBy: params.createdBy,
        isDeleted: false
    });

    newPost.setSlug(params.title);
    newPost.save(function(err) {
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
                        if(doc) doc.childPosts.push(newPost._id);
                    }
                });
            }

            if (params.parentPath) {
                newPost.parentPath = params.parentPath;
                newPost.save();
            }
        }

        // make a relation to courseDiscussion
        if(params.courseId) {
            var cd = new Discussion({
                course: params.courseId,
                createdBy: params.createdBy,
                discussion: newPost._id,
                isDeleted: false
            });

            cd.save(function (err) {
                if (!err) {
                    cd.discussion = newPost;

                    self.getCourseDiscussion(error, cd._id, function(b){
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

module.exports = courseDiscussion;