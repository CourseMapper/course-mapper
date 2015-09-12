var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Controller = require(appRoot + '/modules/votes/votes.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var sessionhelper = require(appRoot + '/libs/core/generalLibs.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');

router.all('/votes/*', sessionhelper.requireAuthentication);

/**
 * return summary of votes of an object
 */
router.get('/votes/:voteType/nid/:nodeId', function (req, res, next) {
    // todo: check for enrollement

    if(!helper.checkRequiredParams(req.params, ['voteTypeId', 'nodeId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();
    //voteTypeId, nodeId
    cat.getVotesSumOfAnItem(
        function (err) {
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        params.voteType,
        mongoose.Types.ObjectId(req.params.nodeId)
        ,
        function (vote) {
            res.status(200).json({
                result: true, vote: vote
            });
        }
    );
});

router.get('/votes/:voteType/nid/:nodeId/documents', function (req, res, next) {
    // todo: check for enrollement

    if(!helper.checkRequiredParams(req.params, ['voteTypeId', 'nodeId'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var cat = new Controller();
    cat.getVotesOfAnItem(
        function (err) {
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        params.voteType,
        mongoose.Types.ObjectId(req.params.nodeId)
        ,
        function (votes) {
            res.status(200).json({
                result: true, votes: votes
            });
        }
    );
});

/**
 * insert a vote
 */
router.post('/votes/:voteType/nid/:nodeId/:operation', function (req, res, next) {
    var cat = new Controller();

    // todo: check for enrollment

    if(!helper.checkRequiredParams(req.params, ['voteType', 'nodeId', 'operation'], function (err) {
            helper.resReturn(err, res);
        }))return;

    var voteValue = 0;
    if(req.params.operation == 'down'){
        voteValue = -1;
    } else if(req.params.operation == 'up'){
        voteValue = 1;
    }

    //params: createdBy, voteTypeId, voteType, voteValue
    cat.insertVote(
        function (err) {
            helper.resReturn(err, res);
        },
        {
            voteTypeId: mongoose.Types.ObjectId(req.params.nodeId),
            voteType: req.params.voteType,
            createdBy: mongoose.Types.ObjectId(req.user._id),
            voteValue: voteValue
        },
        function (vote) {
            res.status(200).json({
                result: true, vote: vote
            });
        }
    );
});

module.exports = router;