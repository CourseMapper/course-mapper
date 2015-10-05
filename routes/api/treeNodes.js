var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Tree = require(appRoot + '/modules/trees/index.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var moment = require('moment');
var mongoose = require('mongoose');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();

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

    // todo: check for enrollement / ownership
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var tr = new Tree();

    req.body.userId = req.user._id;
    req.body.createdBy = mongoose.Types.ObjectId(req.body.userId);
    req.body.courseId = mongoose.Types.ObjectId(req.body.courseId);

    if(req.body._id)
        req.body._id = mongoose.Types.ObjectId(req.body._id);

    if (req.body.parent)
        req.body.parent = mongoose.Types.ObjectId(req.body.parent);

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
});

/**
 * get all tree nodes based on course id
 */
router.get('/treeNodes/course/:courseId', function (req, res, next) {
    var tr = new Tree();

    tr.getTreeNodes(
        function (err) {
            helper.resReturn(err, res);
        },
        {
            courseId: mongoose.Types.ObjectId(req.params.courseId)
        },
        function (treeNodes) {
            res.status(200).json({result: true, treeNodes: treeNodes});
        }
    );
});


/**
 * get all tree nodes based on course id
 */
router.get('/treeNode/:nodeId', function (req, res, next) {
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
 * update node.positionFromRoot value
 */
router.put('/treeNodes/:nodeId/positionFromRoot', function (req, res, next) {
    // check for user rights
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    // todo: check for enrollement / ownership
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var tr = new Tree();

    tr.updateNodePosition(
        function (err) {
            res.status(500).json(err);
        },
        {
            _id: mongoose.Types.ObjectId(req.params.nodeId)
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

    // todo: check for enrollement / ownership
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var tr = new Tree();

    tr.updateNode(
        function (err) {
            helper.resReturn(err, res);
        },
        {
            _id: mongoose.Types.ObjectId(req.params.nodeId)
        }
        ,
        req.body,
        function (tn) {
            res.status(200).json({result: ((tn) ? true : false), treeNode: tn});
        }
    );
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

    // todo: check for enrollement / ownership
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    var tr = new Tree();

    tr.deleteNode(
        function (err) {
            helper.resReturn(err, res);
        },
        {
            _id: mongoose.Types.ObjectId(req.params.nodeId)
        }
        ,
        function (ret) {
            res.status(200).json({result: ret});
        }
    );
});


module.exports = router;