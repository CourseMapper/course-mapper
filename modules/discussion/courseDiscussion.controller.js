var config = require('config');
var Posts = require('./models/posts.js');
var Discussion = require('./models/courseDiscussions.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');

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
        course: courseId
    })
        .populate('discussion').exec(function(err, docs) {
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
courseDiscussion.prototype.getCourseDiscussionPosts = function(error, discussionId, success){
    Posts.find({
        $or: [
            { _id: discussionId },
            { parentPost: discussionId }
            //,{ parentPath : { $in: [ discussionId ] }}
        ]
    }, function(err, docs) {
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
                // get the root
                var doc = cats[i];
                if(!doc[parent]){
                    again(doc);
                    tree.push(doc);
                }
            }

            success(tree);
        } else {
            error(err);
        }
    });
};

courseDiscussion.prototype.editPost = function(error, params, success){
    /*Posts.findOne().exec(function(err, doc){
        if(!err){
            if(doc){

            }
        }
        else error(err);
    });*/

    Posts.update(
        {
            _id: params.postId,
            createdBy: params.userId
        },
        {
            $set: {
                title: params.title,
                content: params.content
            }
        },
        function(err, doc){
            if(err)
                error(err);
            else
                success(doc);
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
                content: "DELETED"
            }
        },
        function(err, doc){
            if(err)
                error(err);
            else
                success(doc);
        });
};

courseDiscussion.prototype.addPost = function(error, params, success){
    var newPost = new Posts({
        title: params.title,
        content: params.content,
        createdBy: params.userId,
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
                createdBy: params.userId,
                discussion: newPost._id
            });

            cd.save(function (err) {
                if (!err) {
                    success(newPost);
                } else error(err);
            });
        }
    });
};

module.exports = courseDiscussion;