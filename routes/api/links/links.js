var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Controller = require(appRoot + '/modules/links/links.controller.js');
var NodeController = require(appRoot + '/modules/trees/index.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');

/**
 * return all posts of this node id
 */
router.get('/:nodeId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
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

        var orderBy = -1;
        if (req.query['orderBy'])
            orderBy = req.query['orderBy'];

        var lastPage = false;
        if (req.query['lastPage'])
            lastPage = parseInt(req.query['lastPage']);

        var pageParams = {
            lastPage: lastPage,
            limit: limit,
            sortBy: sortBy,
            orderBy: parseInt(orderBy)
        };

        var userId = mongoose.Types.ObjectId(req.user._id);
        var nodeId = mongoose.Types.ObjectId(req.params.nodeId);

        var cat = new Controller();
        var nod = new NodeController();

        nod.getNodeAsync()({
                _id: nodeId
            })
            .then(function (tn) {
                if (tn.courseId._id) {
                    userHelper.isEnrolledAsync({userId: userId, courseId: tn.courseId._id})
                        .then(function (isAllwd) {
                            if (!isAllwd)
                                return helper.resReturn(helper.createError401(), res);

                            cat.getNodeLinks(
                                function (err) {
                                    helper.resReturn(err, res);
                                },
                                // parameters
                                nodeId
                                ,
                                pageParams,
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
                }
            })
            .catch(function (err) {
                helper.resReturn(err, res);
            });
    });

/**
 * get all posts/replies under a post
 */
router.get('/:postId/posts', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }

        var linkId = mongoose.Types.ObjectId(req.params.postId);

        var cat = new Controller();
        cat.getReplies(
            function (err) {
                helper.resReturn(err, res);
            },
            // parameters
            linkId
            ,
            function (posts) {
                res.status(200).json({
                    result: true, posts: posts
                });
            }
        );
    });

/**
 * create a new topic under a course
 */
router.post('/:nodeId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }

        if (!helper.checkRequiredParams(req.body, ['title', 'content'], function (err) {
                helper.resReturn(err, res);
            }))return;

        var userId = mongoose.Types.ObjectId(req.user._id);
        var nodeId = mongoose.Types.ObjectId(req.params.nodeId);

        var cat = new Controller();
        var nod = new NodeController();

        nod.getNodeAsync()({
            _id: nodeId
        }).then(function (tn) {
            if (tn.courseId._id) {
                userHelper.isEnrolledAsync({userId: userId, courseId: tn.courseId._id})
                    .then(function (isAllwd) {
                        if (!isAllwd)
                            return helper.resReturn(helper.createError401(), res);

                        cat.addPost(
                            function (err) {
                                helper.resReturn(err, res);
                            },
                            {
                                title: req.body.title,
                                content: req.body.content,
                                description: req.body.description,
                                createdBy: userId,
                                nodeId: nodeId
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
            }
        });
    });

/**
 * update a link
 */
router.put('/:postId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }

        if (!helper.checkRequiredParams(req.body, ['title', 'content'], function (err) {
                helper.resReturn(err, res);
            }))return;

        var linkId = mongoose.Types.ObjectId(req.params.postId);
        var userId = mongoose.Types.ObjectId(req.user._id);

        var cat = new Controller();
        cat.isLinkAuthorized({
                userId: userId,
                linkId: linkId
            })
            .then(function (isAllwd) {
                if (!isAllwd)
                    return helper.resReturn(helper.createError401(), res);

                cat.editPost(
                    function (err) {
                        helper.resReturn(err, res);
                    },
                    {
                        title: req.body.title,
                        content: req.body.content,
                        description: req.body.description,
                        userId: userId,
                        linkId: linkId
                    },
                    req.user,
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

router.delete('/:postId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }

        var linkId = mongoose.Types.ObjectId(req.params.postId);
        var userId = mongoose.Types.ObjectId(req.user._id);

        var cat = new Controller();
        cat.isLinkAuthorized({
                userId: userId,
                linkId: linkId
            })
            .then(function (isAllwd) {
                if (!isAllwd)
                    return helper.resReturn(helper.createError401(), res);

                cat.deletePost(
                    function (err) {
                        helper.resReturn(err, res);
                    },
                    {
                        linkId: linkId
                    },
                    req.user,
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

router.delete('/:nodeId/link/:postId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        if (!req.user) {
            res.status(401).send('Unauthorized');
            return;
        }

        var linkId = mongoose.Types.ObjectId(req.params.postId);
        var userId = mongoose.Types.ObjectId(req.user._id);

        var cat = new Controller();
        cat.isLinkAuthorized({
                userId: userId,
                linkId: linkId
            })
            .then(function (isAllwd) {
                if (!isAllwd)
                    return helper.resReturn(helper.createError401(), res);

                cat.deletePost(
                    function (err) {
                        helper.resReturn(err, res);
                    },
                    {
                        linkId: linkId,
                        nodeId: mongoose.Types.ObjectId(req.params.nodeId)
                    },
                    req.user,
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

module.exports = router;