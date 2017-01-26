var rootpath = require('app-root-path');
var mongoose = require('mongoose');
var agg = require('./models/hub.js');
var personalSpace = require('./models/PersonalHub.js');
var posts = agg.posts;
var scrape = require(rootpath + '/modules/learningHub/scraper/scrape.js');
var Plugin = require(rootpath + '/modules/apps-gallery/backgroundPlugins.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');

function hubcontroller() {

}

var checkHasRightToModify = function (model, user) {
    if (!model || !user || !user.role) {
        return false;
    }
    var isAuthor = model.authorId === user._id;
    var isAdmin = user.role === 'admin';
    return isAuthor || isAdmin;
};
//scrape the content
hubcontroller.prototype.scrape = function (url, callback) {
    console.log("controller called");
    scrape.getInfo(url, function (error, res) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, res);
        }
    });
};

//create a new post
hubcontroller.prototype.add = function (error, params, success) {
    console.log(params);
    var newPost = new posts({
        courseId: params.courseId,
        contentId: params.contentId,
        postId: new mongoose.Types.ObjectId,
        userId: params.userId,
        title: params.title,
        url: params.url,
        type: params.type,
        favicon: params.favicon ? params.favicon : null,
        hostName: params.hostName ? params.hostName : null,
        image: params.image ? params.image : null,
        embedHtml: params.html ? params.html : null,
        description: params.description ? params.description : null,
        isDeleted: false,
        tags: params.tags
    });

    newPost.setSlug(params.title);

    newPost.save(function (err) {
        if (err) {
            error(err);
            return;

        } else {
            Plugin.doAction('onAfterLinkCreated', newPost);
            success(newPost);
        }
    })

};
// search in the posts
hubcontroller.prototype.search = function (query, success, error) {
    var searchQuery = '/^' + query + '/i';
    posts.find({
            isDeleted: false,
            $text: {
                $search: query
            }
        }
    ).sort({'dateAdded': -1}).exec(function (err, posts) {
        if (err) {
            console.log(err);
            error(err);
            return;
        } else {
            success(posts);
            return;
        }
    })
};
// add it to the persoalSpace
hubcontroller.prototype.addPersonal = function (error, params, success) {
    console.log("create post");
    console.log(params);
    var tempPost = {
        courseId: mongoose.Types.ObjectId(params.courseId),
        contentId: mongoose.Types.ObjectId(params.contentId),
        postId: mongoose.Types.ObjectId(params.postId),
        userId: mongoose.Types.ObjectId(params.userId),
        title: params.title,
        url: params.url,
        type: params.type,
        favicon: params.favicon ? params.favicon : null,
        hostName: params.hostName ? params.hostName : null,
        image: params.image ? params.image : null,
        embedHtml: params.html ? params.html : null,
        description: params.description ? params.description : null,
        tags: params.tags
    };
    posts.findOneAndUpdate(
        {
            postId: params.postId
        },{
            $push:{
                personalUsers : {
                    userId:params.currentUser
                }
            }
        }, function(err, doc){
            if(err){
                error(err);
            }else{
                personalSpace.findOneAndUpdate(
                    {
                        userId: params.currentUser
                    }, {
                        $push: {
                            posts: tempPost
                        }
                    }, function (err, doc) {
                        if (err) {
                            console.log("first error");

                        } else {
                            if(doc == null){
                                var newPost = new personalSpace();
                                newPost.userId = params.currentUser;
                                newPost.posts.push(tempPost);
                                newPost.save(function (err) {
                                    if (err) {
                                        console.log("second error");
                                        error(err);
                                    } else {
                                        console.log("added");
                                        success("added to personal space");
                                    }
                                });
                            }else{
                                success("added to personal space");
                            }

                        }
                    }
                );
            }
        }
    );
};

hubcontroller.prototype.deletePersonal = function (query, success, error) {
    console.log("here");
    console.log(query);
    personalSpace.update(
        {
            userId: query.userId
        }, {
            $pull: {
                posts: {
                    postId: query.postId
                }
            }
        }, function (err) {
            if (err) {
                error(err);
            } else {
                posts.update({
                    postId : query.postId
                },{
                    $pull:{
                        personalUsers:{
                            userId: query.userId
                        }
                    }
                }, function(err){
                    if (err){
                        error(err)
                    } else{
                        success("Removed from personal space");
                    }
                })

            }
        }
    )
}

// delete a post
hubcontroller.prototype.delete = function (query, success, error) {

    posts.update(
        {
            postId: query.postId
        }, {
            $set: {
                "isDeleted": true
            }
        }, function (err) {
            if (err) {
                error(err);
            } else {
                success("deleted");
            }
        }
    )
};
// edit a post
hubcontroller.prototype.edit = function (body, success, error) {
    posts.update(
        {
            postId: body.postId
        }, {
            $set: {
                "title": body.title,
                "description": body.description,
                "tags": body.tags
            }
        }, function (err) {
            if (err) {
                error(err);
            } else {
                success("edited");
            }
        }
    )
};
// comment on a post
hubcontroller.prototype.comment = function (error, params, success) {
    agg.update(
        {
            postId: params.postId
        },
        {
            $push: {
                "comments": {
                    "commentId": new mongoose.Types.ObjectId,
                    "userId": params.userId,
                    "isDeleted": false,
                    "comment": params.content,
                    "userName": params.userName
                }


            }
        },
        function (err) {
            if (err) {
                error(err);
            } else {
                success();
            }
        }
    )

};
// get all the links
hubcontroller.prototype.getlinks = function (err, params, success) {
    var dateSort = params.sortBy == "newest" ? -1 : 1;
    console.log(params.sortBy + "" + dateSort);
    if (params.type == 'all') {
        posts.find({
            contentId: params.contentId,
            isDeleted: false
        }).sort({'dateAdded': dateSort}).exec(function (error, posts) {
            if (error) {
                err(error);
                return;
            } else {
                console.log(posts);
                success(posts);
                return;
            }
        })
    } else {
        posts.find({
            contentId: params.contentId,
            isDeleted: false,
            type: params.type
        }).sort({'dateAdded': dateSort}).exec(function (error, posts) {
            if (error) {
                error(error);
                return;
            } else {
                success(posts);
                return;
            }
        })
    }
};

hubcontroller.prototype.getPersonallinks = function (err, params, success) {
    var dateSort = params.sortBy == "newest" ? -1 : 1;
    console.log(params);
    console.log(params.sortBy + "" + dateSort);
    if (params.type == 'all') {
        personalSpace.find({
            userId: params.userId,
            posts:{
                $elemMatch:{
                    contentId:params.contentId
                }
            }

        },{
            '_id': 0,
            'posts':1
        }).sort({'posts.dateAdded': dateSort}).exec(function (error, posts) {
            if (error) {
                err(error);
                return;
            } else {
                console.log(posts);
                success(posts);
                return;
            }
        })
    } else {
        personalSpace.find({
            userId: params.userId,
            posts:{
                $elemMatch:{
                    contentId:params.contentId,
                    type: params.type
                }
            }
        },{
            '_id': 0,
            'posts':1
        }).sort({'dateAdded': dateSort}).exec(function (error, posts) {
            if (error) {
                error(error);
                return;
            } else {
                console.log(posts);
                success(posts);
                return;
            }
        })
    }
};

var findByIdAsync = async(function (id) {
    return await(posts.findById(id).exec());
});

hubcontroller.prototype.addCommentAsync = async(function (params, user) {
    console.log("inside mon");
    console.log(params);
    console.log(user);
    var postId = params.postId;
    var commentText = params.text;
    var post = await(findByIdAsync(postId));
    console.log(post);
    if (!post) {
        return;
    }
    var comment = {
        text: commentText,
        author: user.username || 'Unknown',
        authorId: user._id,
        authorDisplayName: user.displayName || user.username || 'Unknown'
    };
    post.comments.push(comment);
    console.log('pushed');
    await(post.save());
    return post;
});

hubcontroller.prototype.removeCommentAsync = async(function (params, user) {
    var postId = params.postId;
    var commentId = params.commentId;
    var post = await(findByIdAsync(postId));
    console.log(post);
    if (!post) {
        return;
    }
    for (var i = 0; i < post.comments.length; i++) {
        if (post.comments[i]._id.toString() === commentId) {
            var comment = post.comments[i];
            if (checkHasRightToModify(comment, user)) {
                post.comments[i].remove();
                console.log("rem");
            }
            break;
        }
    }
    await(post.save());
    return post;
});

module.exports = new hubcontroller();
