var rootpath = require('app-root-path');
var mongoose = require('mongoose');
var agg = require('./models/hub.js');
var personalSpace = require('./models/personalHub.js');
var posts = agg.posts;
var scrape = require(rootpath + '/modules/learningHub/Scraper/scrape.js');
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
            Plugin.doAction('onAfterLearningHubLinkCreated', newPost);
            success(newPost);
        }
    })

};
// get all the links
hubcontroller.prototype.getlinks = function (err, params, success) {
    var dateSort = params.sortBy == "Newest First" ? -1 : 1;
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

    aggQuery = aggQuery.concat([
       {
        $match:{
            'contentId':params.contentId
        }
    },{
        $match:{
            'isDeleted':false
        }
    }]);

    if(params.type != 'all'){
        aggQuery.push({
            $match:{
                'type':params.type
            }
        });
    }

    if(params.sortBy === "Most Commented"){
        aggQuery = aggQuery.concat([{
            $project:{
                "courseId": 1,
                "postId": 1,
                "userId": 1,
                "contentId": 1,
                "title": 1,
                "url": 1,
                "type": 1,
                "favicon": 1,
                "hostName": 1,
                "image": 1,
                "embedHtml": 1,
                "description": 1,
                "isDeleted": 1,
                "totalVotes": 1,
                "dateAdded": 1,
                "dateUpdated": 1,
                "personalUsers": 1,
                "comments": 1,
                "tags": 1,
                "slug": 1,
                "commentLength": {
                    "$size" : "$comments"
                }
            }
        },{
            $sort:{
                'commentLength': -1
            }
        }])
    }else if(params.sortBy === "Most Popular"){
        aggQuery = aggQuery.concat([{
            $lookup: {
                from: "votes",
                localField: "postId",
                foreignField: "voteTypeId",
                as: "votes"
            }
        },
            {
                $sort:{
                    'votes.voteValue': -1
                }
            }]);
    } else{
        aggQuery = aggQuery.concat([{
            $sort:{
                'dateAdded':dateSort
            }
        }]);
    }

    posts.aggregate(aggQuery,function (error, posts) {
        if (error) {
            err(error);
            return;
        } else {
            success(posts);
            return;
        }
    });

};
// delete a post
hubcontroller.prototype.delete = function (query, user, success, error) {

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
                Plugin.doAction('onAfterLearningHubLinkDeleted', query, user);
                success("deleted");
            }
        }
    )
};

// edit a post
hubcontroller.prototype.edit = function (body, user , success, error) {
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
                Plugin.doAction('onAfterLearningHubLinkEdited', body, user);
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
    console.log(params);
    var tempPost = {
        courseId: mongoose.Types.ObjectId(params.courseId),
        contentId: mongoose.Types.ObjectId(params.contentId),
        postId: mongoose.Types.ObjectId(params.postId),
        userId: mongoose.Types.ObjectId(params.currentUser),
        title: params.title,
        url: params.url,
        type: params.type,
        favicon: params.favicon ? params.favicon : null,
        hostName: params.hostName ? params.hostName : null,
        image: params.image ? params.image : null,
        embedHtml: params.embedHtml ? params.embedHtml : null,
        description: params.description ? params.description : null,
        dateAdded: new Date(),
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
                var personalPost = new personalSpace(tempPost);
                personalPost.save(function(err){
                    if(err){
                        console.log(err);
                        error(err);
                    }else{
                        success(personalPost);
                    }
                })
            }
        }
    );
};

// get all posts in personalSpace for the user and content
hubcontroller.prototype.getPersonallinks = function (err, params, success) {
    var dateSort = params.sortBy == "Newest First" ? -1 : 1;
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
        }},{
            $match:{
                'contentId':params.contentId
            }
        }]);

    if(params.type != 'all'){
        aggQuery.push({
            $match:{
                'type':params.type
            }
        });
    }


    aggQuery = aggQuery.concat([{
        $sort:{
            'dateAdded':dateSort
        }
    }]);

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
    personalSpace.findOneAndRemove(
        {
            userId: query.userId,
            postId: query.postId
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
    var comment = new agg.comments({
        text: commentText,
        author: user.username || 'Unknown',
        authorId: user._id,
        authorDisplayName: user.displayName || user.username || 'Unknown'
    });
    post.comments.push(comment);

    //await(post.save());

    await(post.save(function (err) {
        if (err) {
            return;
        } else {
            Plugin.doAction('onAfterLearningHubCommentAdded', post, comment);
        }
    }));
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
