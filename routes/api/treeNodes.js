var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Tree = require(appRoot + '/modules/trees/index.js');
var debug = require('debug')('cm:route');
var moment = require('moment');
var mongoose = require('mongoose');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();

/**
 * POST
 * create course
 */
router.post('/treeNodes', multipartyMiddleware, function(req, res, next){
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

    tr.addTreeNode(
        function (err) {
            res.status(200).json({
                result: false,
                errors: [err.message]
            });
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
router.get('/treeNodes/course/:courseId', function(req, res, next) {
    var tr = new Tree();

    tr.getTreeNodes(
        function (err) {
            res.status(200).json({
                result: false,
                errors: [err.message]
            });
        },
        {
            courseId: mongoose.Types.ObjectId(req.params.courseId)
        },
        function(treeNodes){
            res.status(200).json({result:true, treeNodes: treeNodes});
        }
    );
});

/**
 * update node.positionFromRoot value
 */
router.put('/treeNodes/:nodeId/positionFromRoot', function(req, res, next) {
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
        function(err){
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
        function(tn){
            res.status(200).json({treeNode: tn});
        }
    );
});


module.exports = router;