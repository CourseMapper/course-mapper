var config = require('config');
var Posts = require('../discussion/models/posts.js');
var Links = require('./models/links.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');

function NodeLinks(){
}

/**
 * find root posts based on params,
 * populate all of its child posts
 *
 * @param error
 * @param params
 * @param success
 */
NodeLinks.prototype.getNodeLinks = function(error, nodeId, success){
    if(!nodeId)
        return error(helper.createError(msg, 400));

    Links.find({
        contentNode: nodeId,
        isDeleted: false
    })
        .sort({dateAdded: -1})
        .populate('link')
        .populate('createdBy', 'username')
        .exec(function(err, docs) {
            if (err){
                error(err);
            } else {
                success(docs);
            }
        });
};

NodeLinks.prototype.getNodeLink = function(error, pId, success){
    if(!pId)
        return error(helper.createError(msg, 400));

    Links.findOne({
        _id: pId
    })
        .sort({dateAdded: -1})
        .populate('link')
        .populate('createdBy', 'username')
        .exec(function(err, doc) {
            if (err) {
                error(err);
            } else {
                if(!doc){
                    helper.createError404('Course')
                } else {
                    success(doc);
                }
            }
        });
};

NodeLinks.prototype.editPost = function(error, params, success){
    Posts.findOneAndUpdate(
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
        {safe: true, upsert: true},
        function(err, doc){
            if(err)
                error(err);
            else
                success(doc);
        });
};

NodeLinks.prototype.deletePost = function(error, params, success){
    Posts.update(
        {
            _id: params.postId,
            createdBy: params.userId
        },
        {
            $set: {
                isDeleted: true
            }
        },
        function(err, doc){
            if(err)
                error(err);
            else {
                if(params.nodeId){
                    Links.update({
                            link: params.postId,
                            createdBy: params.userId
                        },
                        {
                            $set: {
                                isDeleted: true
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

NodeLinks.prototype.addPost = function(error, params, success){
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

        // make a relation to NodeLinks
        if(params.nodeId) {
            var cd = new Links({
                contentNode: params.nodeId,
                createdBy: params.createdBy,
                link: newPost._id,
                isDeleted: false
            });

            cd.save(function (err) {
                if (!err) {
                    //cd.link = newPost;
                    self.getNodeLink(error, cd._id, function(b){
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

module.exports = NodeLinks;