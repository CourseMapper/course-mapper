var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Tree = require(appRoot + '/modules/trees/index.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');

var moment = require('moment');
var mongoose = require('mongoose');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();

/**
 * get all tree nodes based on course id
 */
router.get('/treeNodes/course/:courseId', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var courseId = mongoose.Types.ObjectId(req.params.courseId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    userHelper.isEnrolledAsync({userId: userId, courseId: courseId})
        .then(function (isAllowd) {
            if (!isAllowd)
                return helper.resReturn(helper.createError401(), res);

            var tr = new Tree();

            tr.getTreeNodes(
                function (err) {
                    helper.resReturn(err, res);
                },
                {
                    courseId: courseId
                },
                function (treeNodes) {
                    res.status(200).json({result: true, treeNodes: treeNodes});
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * get all tree nodes underneath a node id
 */
router.get('/treeNode/:nodeId', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var tr = new Tree();

    tr.getTreeNode(
        function (err) {
            helper.resReturn(err, res);
        },
        {
            _id: mongoose.Types.ObjectId(req.params.nodeId)
        },
        function (treeNode) {
            res.status(200).json({result: true, treeNode: treeNode});
        }
    );
});

/**
 * POST
 * create node, and allow upload
 * edit node, because multipart form data can use POST
 */
router.post('/treeNodes', multipartyMiddleware, function (req, res, next) {
    // check for user logins
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    req.body.userId = req.user._id;
    req.body.createdBy = mongoose.Types.ObjectId(req.body.userId);
    req.body.courseId = mongoose.Types.ObjectId(req.body.courseId);

    if (req.body._id)
        req.body._id = mongoose.Types.ObjectId(req.body._id);

    if (req.body.parent)
        req.body.parent = mongoose.Types.ObjectId(req.body.parent);

    userHelper.isEnrolledAsync({userId: req.body.createdBy, courseId: req.body.courseId})
        .then(function (isAllowd) {
            if (!isAllowd)
                return helper.resReturn(helper.createError401(), res);

            var tr = new Tree();

            tr.addTreeNode(
                function (err) {
                    helper.resReturn(err, res);
                },

                // parameters
                req.body,

                // files pdf and video
                req.files,

                function (course) {
                    res.status(200).json({
                        result: true,
                        treeNode: course
                    });
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * update node.positionFromRoot value
 */
router.put('/treeNodes/:nodeId/positionFromRoot', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    var tr = new Tree();
    tr.isNodeAuthorized({nodeId: nodeId, userId: userId})
        .then(function (isAllwd) {
            if (!isAllwd)
                return helper.resReturn(helper.createError401(), res);

            tr.updateNodePosition(
                function (err) {
                    helper.resReturn(err, res);
                },
                {
                    _id: nodeId
                }
                ,
                {
                    x: req.body.x,
                    y: req.body.y
                },
                function (tn) {
                    res.status(200).json({treeNode: tn});
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * update node name value
 */
router.put('/treeNodes/:nodeId', function (req, res, next) {
    // check for user rights
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    var tr = new Tree();
    tr.isNodeAuthorized({nodeId: nodeId, userId: userId})
        .then(function (isAllwd) {
            if (!isAllwd)
                return helper.resReturn(helper.createError401(), res);

            tr.updateNode(
                function (err) {
                    helper.resReturn(err, res);
                },
                {
                    _id: nodeId
                }
                ,
                req.body,
                function (tn) {
                    res.status(200).json({result: ((tn) ? true : false), treeNode: tn});
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

/**
 * delete a node (setting isDeleted to true)
 */
router.delete('/treeNodes/:nodeId', function (req, res, next) {
    // check for user rights
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var nodeId = mongoose.Types.ObjectId(req.params.nodeId);
    var userId = mongoose.Types.ObjectId(req.user._id);

    var tr = new Tree();
    tr.isNodeAuthorized({nodeId: nodeId, userId: userId})
        .then(function (isAllwd) {
            if (!isAllwd)
                return helper.resReturn(helper.createError401(), res);

            tr.deleteNode(
                function (err) {
                    helper.resReturn(err, res);
                },
                {
                    _id: nodeId
                }
                ,
                function (ret) {
                    res.status(200).json({result: ret});
                }
            );
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});
 
module.exports = router;