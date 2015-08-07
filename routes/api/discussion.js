var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var CourseDiscussionController = require(appRoot + '/modules/discussion/courseDiscussion.controller.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');

/**
 * return all posts
 */
router.get('/discussions/:courseId', function(req, res, next) {
    var cat = new CourseDiscussionController();
    cat.getCourseDiscussions(
        function(err){
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        // parameters
        mongoose.Types.ObjectId(req.params.courseId)
        ,
        function(posts){
            res.status(200).json({
                result:true, posts: posts
            });
        }
    );
});

router.post('/discussions/:courseId', function(req, res, next){
    var cat = new CourseDiscussionController();

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
            courseId: mongoose.Types.ObjectId(req.params.courseId),
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

router.post('/discussions/replies', function(req, res, next){
    var cat = new CourseDiscussionController();

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
            title: "",
            content: req.body.content,
            createdBy: mongoose.Types.ObjectId(req.user._id),
            parentPost:req.params.parentPost
            //params.parentPath: []
        },
        function(post){
            res.status(200).json({
                result:true, post: post
            });
        }
    );
});

router.put('/discussion/:postId', function(req, res, next){
    var cat = new CourseDiscussionController();
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

router.delete('/discussion/:postId', function(req, res, next){
    var cat = new CourseDiscussionController();
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

/**
 * get all posts/replies under a post
 */
router.get('/discussions/:postId/posts', function(req, res, next) {
    var cat = new CourseDiscussionController();
    cat.getCourseDiscussionPosts(
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

module.exports = router;