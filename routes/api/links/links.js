var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Controller = require(appRoot + '/modules/links/links.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');

/**
 * return all posts of this node id
 */
router.get('/:nodeId', function(req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var limit = 10;
    if (req.query['limit']) {
        var limitTemp = parseInt(req.query['limit']);
        if (limitTemp != NaN)
            limit = limitTemp;
    }

    var sortBy = 'dateAdded';
    if (req.query['sortBy'])
        sortBy = req.query['sortBy'];

    var lastPage = false;
    if (req.query['lastPage'])
        lastPage = parseInt(req.query['lastPage']);

    var pageParams = {
        lastPage: lastPage,
        limit: limit,
        sortBy: sortBy
    };

    //todo: check user auth / enrollement

    if(!helper.checkRequiredParams(req.params, ['nodeId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();
    cat.getNodeLinks(
        function(err){
            helper.resReturn(err, res);
        },
        // parameters
        mongoose.Types.ObjectId(req.params.nodeId)
        ,
        pageParams,
        function(posts){
            res.status(200).json({
                result:true, posts: posts
            });
        }
    );
});


/**
 * get all posts/replies under a post
 */
router.get('/:postId/posts', function(req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }
    if(!helper.checkRequiredParams(req.params, ['postId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();
    cat.getReplies(
        function(err){
            helper.resReturn(err, res);
        },
        // parameters
        mongoose.Types.ObjectId(req.params.postId)
        ,
        function(posts){
            res.status(200).json({
                result:true, posts: posts
            });
        }
    );
});

/**
 * create a new topic under a course
 */
router.post('/:nodeId', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    // todo: check for enrollment
    {
        //
    }

    if(!helper.checkRequiredParams(req.body, ['title', 'content'], function (err) {
            helper.resReturn(err, res);
        }))return;

    if(!helper.checkRequiredParams(req.params, ['nodeId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();

    cat.addPost(
        function(err){
            helper.resReturn(err, res);
        },
        {
            title: req.body.title,
            content: req.body.content,
            createdBy: mongoose.Types.ObjectId(req.user._id),
            nodeId: mongoose.Types.ObjectId(req.params.nodeId)
        },
        function(post){
            res.status(200).json({
                result:true, post: post
            });
        }
    );

    /*for(var i = 0; i < 50;i++) {
        cat.addPost(
            function (err) {
                helper.resReturn(err, res);
            },
            {
                title: req.body.title + ' -- ' + i,
                content: req.body.content,
                createdBy: mongoose.Types.ObjectId(req.user._id),
                nodeId: mongoose.Types.ObjectId(req.params.nodeId)
            },
            function (post) {
                /!*res.status(200).json({
                 result:true, post: post
                 });*!/
            }
        );
    }*/
});

/**
 * update a link
 */
router.put('/:postId', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    // todo: auth


    if(!helper.checkRequiredParams(req.body, ['title', 'content'], function (err) {
            helper.resReturn(err, res);
        }))return;

    if(!helper.checkRequiredParams(req.params, ['postId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();
    cat.editPost(
        function(err){
            helper.resReturn(err, res);
        },
        {
            title: req.body.title,
            content: req.body.content,
            postId: mongoose.Types.ObjectId(req.params.postId),
            userId: mongoose.Types.ObjectId(req.user._id)
        },
        function(post){
            res.status(200).json({
                result:true, post: post
            });
        }
    );
});

router.delete('/:postId', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    if(!helper.checkRequiredParams(req.params, ['postId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();
    cat.deletePost(
        function(err){
            helper.resReturn(err, res);
        },
        {
            postId: mongoose.Types.ObjectId(req.params.postId),
            userId: mongoose.Types.ObjectId(req.user._id)
        },
        function(post){
            res.status(200).json({
                result:true, post: post
            });
        }
    );
});

router.delete('/:nodeId/link/:postId', function(req, res, next){
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    if(!helper.checkRequiredParams(req.params, ['postId', 'nodeId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();
    cat.deletePost(
        function(err){
            helper.resReturn(err, res);
        },
        {
            postId: mongoose.Types.ObjectId(req.params.postId),
            nodeId: mongoose.Types.ObjectId(req.params.nodeId),
            userId: mongoose.Types.ObjectId(req.user._id)
        },
        function(post){
            res.status(200).json({
                result:true, post: post
            });
        }
    );
});

module.exports = router;