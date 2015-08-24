var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Controller = require(appRoot + '/modules/links/links.controller.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');

/**
 * return all posts
 */
router.get('/:nodeId', function(req, res, next) {
    var cat = new Controller();
    cat.getNodeLinks(
        function(err){
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        // parameters
        mongoose.Types.ObjectId(req.params.nodeId)
        ,
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
    var cat = new CourseDiscussionController();
    cat.getReplies(
        function(err){
            res.status(500).json({
                result: false,
                errors: err
            });
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
    var cat = new Controller();

    // todo: check for enrollment
    {
        //
    }

    cat.addPost(
        function(err){
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        {
            title: req.body.title,
            content: req.body.content,
            createdBy: mongoose.Types.ObjectId(req.user._id),
            nodeId: mongoose.Types.ObjectId(req.params.nodeId)
            //params.parentPost
            //params.parentPath
        },
        function(post){
            res.status(200).json({
                result:true, post: post
            });
        }
    );
});

router.put('/:postId', function(req, res, next){
    // todo: auth

    var cat = new Controller();
    cat.editPost(
        function(err){
            res.status(500).json({
                result: false,
                errors: err
            });
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
    var cat = new Controller();
    cat.deletePost(
        function(err){
            res.status(500).json({
                result: false,
                errors: err
            });
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

router.delete('/:nodeId/topic/:postId', function(req, res, next){
    var cat = new Controller();
    cat.deletePost(
        function(err){
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        {
            postId: mongoose.Types.ObjectId(req.params.postId),
            courseId: mongoose.Types.ObjectId(req.params.courseId),
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