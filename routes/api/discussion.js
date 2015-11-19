var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var CourseDiscussionController = require(appRoot + '/modules/discussion/courseDiscussion.controller.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

/**
 * return all posts of a course
 */
router.get('/discussions/:courseId', function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    userHelper.isEnrolledAsync({
            userId: mongoose.Types.ObjectId(req.user._id),
            courseId: mongoose.Types.ObjectId(req.params.courseId)
        })
        .then(function (isEnrolled) {
            if (!isEnrolled) {
                return helper.resReturn(helper.createError401(), res);
            }

            var cat = new CourseDiscussionController();
            cat.getCourseDiscussions(
                function (err) {
                    res.status(500).json({
                        result: false,
                        errors: err
                    });
                },
                // parameters
                mongoose.Types.ObjectId(req.params.courseId)
                ,
                function (posts) {
                    res.status(200).json({
                        result: true, posts: posts
                    });
                }
            );

        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * get all posts/replies under a post
 */
router.get('/discussion/:postId/posts', function (req, res, next) {
    if (!req.user)
        return helper.resReturn(helper.createError401(), res);

    var CD = new CourseDiscussionController();

    var params = {
        postId: mongoose.Types.ObjectId(req.params.postId),
        userId: mongoose.Types.ObjectId(req.user._id)
    };

    CD.isPostEnrolled(params)
        .then(function (isEnrolled) {
            if (!isEnrolled) {
                return helper.resReturn(helper.createError401(), res);
            }

            CD.getReplies(
                function (err) {
                    res.status(500).json({
                        result: false,
                        errors: err
                    });
                },
                // parameters
                params.postId
                ,
                function (posts) {
                    res.status(200).json({
                        result: true, posts: posts
                    });
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * create a new topic under a course
 */
router.post('/discussions/:courseId', function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    if (!helper.checkRequiredParams(req.body, ['title', 'content'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var courseId = mongoose.Types.ObjectId(req.params.courseId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    var p = {
        courseId: courseId,
        userId: userId
    };

    var CD = new CourseDiscussionController();

    userHelper.isEnrolledAsync(p)
        .then(function (isEnrolled) {
            if (!isEnrolled) {
                return helper.resReturn(helper.createError401(), res);
            }

            CD.addPost(
                function (err) {
                    helper.resReturn(err, res);
                },
                {
                    title: req.body.title,
                    content: req.body.content,
                    createdBy: userId,
                    courseId: courseId
                },
                function (post) {
                    res.status(200).json({
                        result: true, post: post
                    });
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * create a new reply under a post
 */
router.post('/discussion/replies', function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    if (!helper.checkRequiredParams(req.body, ['content'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var CD = new CourseDiscussionController();

    var params = {
        postId: mongoose.Types.ObjectId(req.body.parentPost),
        userId: mongoose.Types.ObjectId(req.user._id)
    };

    CD.isPostEnrolled(params)
        .then(function (isEnrolled) {
            if (!isEnrolled)
                return helper.resReturn(helper.createError401(), res);

            CD.addPost(
                function (err) {
                    helper.resReturn(err, res)
                },
                {
                    title: " ",
                    content: req.body.content,
                    createdBy: params.userId,
                    parentPost: params.postId
                },
                function (post) {
                    res.status(200).json({
                        result: true, post: post
                    });
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * edit any type of post (topic or reply)
 */
router.put('/discussion/:postId', function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    if (!helper.checkRequiredParams(req.body, ['title', 'content'], function (err) {
            helper.resReturn(err, res);
        }))return;

    if (!helper.checkRequiredParams(req.params, ['postId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var CD = new CourseDiscussionController();
    var params = {
        title: req.body.title,
        content: req.body.content,
        postId: mongoose.Types.ObjectId(req.params.postId),
        userId: mongoose.Types.ObjectId(req.user._id)
    };

    CD.isPostAuthorized(params)
        .then(function (isAllowd) {
            if (!isAllowd)
                return helper.resReturn(helper.createError401(), res);

            CD.editPost(
                function (err) {
                    helper.resReturn(err, res)
                },
                params,
                function (post) {
                    res.status(200).json({
                        result: true, post: post
                    });
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

router.delete('/discussion/:postId', function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    var params = {
        postId: mongoose.Types.ObjectId(req.params.postId),
        userId: mongoose.Types.ObjectId(req.user._id)
    };

    var CD = new CourseDiscussionController();
    CD.isPostAuthorized(params)
        .then(function (isAllwd) {
            if (!isAllwd)
                return helper.resReturn(helper.createError401(), res);

            CD.deletePost(
                function (err) {
                    helper.resReturn(err, res);
                },
                params,
                function (post) {
                    res.status(200).json({
                        result: true, post: post
                    });
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res)
        });
});

router.delete('/discussions/:courseId/topic/:postId', function (req, res, next) {
    if (!req.user)
        return res.status(401).send('Unauthorized');

    var params = {
        postId: mongoose.Types.ObjectId(req.params.postId),
        courseId: mongoose.Types.ObjectId(req.params.courseId),
        userId: mongoose.Types.ObjectId(req.user._id)
    };

    var CD = new CourseDiscussionController();

    // check for admin and manager and crs owner or post owner
    CD.isPostAuthorized(params)
        .then(function (isAllwd) {
            if (!isAllwd)
                return helper.resReturn(helper.createError401(), res);

            CD.deletePost(
                function (err) {
                    res.status(500).json({
                        result: false,
                        errors: err
                    });
                },
                params
                ,
                function (post) {
                    res.status(200).json({
                        result: true, post: post
                    });
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res)
        });
});

module.exports = router;