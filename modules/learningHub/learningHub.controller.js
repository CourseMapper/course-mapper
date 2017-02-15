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
    scrape.getInfo(url, function (error, res) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, res);
        }
    });
};

/**
 * Methods for handling CRUD in public space
 */
//add a new post
hubcontroller.prototype.add = function (error, params, success) {

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
// get all the links
hubcontroller.prototype.getlinks = function (err, params, success) {
    var dateSort = params.sortBy == "newest" ? -1 : 1;
    if (params.type == 'all') {
        posts.find({
            contentId: params.contentId,
            isDeleted: false
        }).sort({'dateAdded': dateSort}).exec(function (error, posts) {
            if (error) {
                err(error);
                return;
            } else {
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
// search in the posts in public space
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

/**
 * Methods for handling CRUD in personal space
 */
// add a post to  personalSpace
hubcontroller.prototype.addPersonal = function (error, params, success) {

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
        dateAdded: new Date,
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
                            error(err);

                        } else {
                            if(doc == null){
                                var newPost = new personalSpace();
                                newPost.userId = params.currentUser;
                                newPost.posts.push(tempPost);
                                newPost.save(function (err) {
                                    if (err) {
                                        error(err);
                                    } else {
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

// get all posts in personalSpace for the user and content
hubcontroller.prototype.getPersonallinks = function (err, params, success) {
    var dateSort = params.sortBy == "newest" ? -1 : 1;
    var aggQuery = [];

    if(params.searchQuery != '') {
        var query = '/^' + params.searchQuery + '/i';
        aggQuery.push({
                $match: {
                    $text: {
                        $search: params.searchQuery
                    }
                }
            }
        )
    }

    aggQuery = aggQuery.concat([{
        $match:{
            userId:params.userId
        }},
        {
            $project:{
                '_id':0, 'posts':1
            }
        },
        {
            $unwind:"$posts"
        },{
            $match:{
                'posts.contentId':params.contentId
            }
        }]);

    if(params.type != 'all'){
        aggQuery.push({
            $match:{
                'posts.type':params.type
            }
        });
    }


    aggQuery = aggQuery.concat([{
        $sort:{
            'posts.dateAdded':dateSort
        }
    },{
        $group:{
            _id:"$posts.contentId",posts:{
                $push:"$posts"
            }
        }
    }]);

    console.log(aggQuery);

    personalSpace.aggregate(aggQuery,function (error, posts) {
        if (error) {
            err(error);
            return;
        } else {
            success(posts);
            return;
        }
    });

};

//remove a post from personalSpace
hubcontroller.prototype.deletePersonal = function (query, success, error) {
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



var findByIdAsync = async(function (id) {
    return await(posts.findById(id).exec());
});

hubcontroller.prototype.addCommentAsync = async(function (params, user) {

    var postId = params.postId;
    var commentText = params.text;
    var post = await(findByIdAsync(postId));

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

    await(post.save());
    return post;
});

hubcontroller.prototype.removeCommentAsync = async(function (params, user) {
    var postId = params.postId;
    var commentId = params.commentId;
    var post = await(findByIdAsync(postId));

    if (!post) {
        return;
    }
    for (var i = 0; i < post.comments.length; i++) {
        if (post.comments[i]._id.toString() === commentId) {
            var comment = post.comments[i];
            if (checkHasRightToModify(comment, user)) {
                post.comments[i].remove();

            }
            break;
        }
    }
    await(post.save());
    return post;
});


module.exports = new hubcontroller();
