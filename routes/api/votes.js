var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Controller = require(appRoot + '/modules/votes/votes.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var sessionhelper = require(appRoot + '/libs/core/sessionHelper.js');
var debug = require('debug')('cm:route');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');

router.all('/votes/*', function (req, res, next) {
    sessionhelper.requireAuthentication(req, res, next);
});

/**
 * return summary of votes of an object
 */
router.get('/votes/:voteType/id/:voteTypeId', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {

        if (!helper.checkRequiredParams(req.params, ['voteTypeId', 'voteType'], function (err) {
                helper.resReturn(err, res);
            }))return;

        var cat = new Controller();
        //voteTypeId, voteType
        cat.getVotesSumOfAnItem(
            function (err) {
                res.status(500).json({
                    result: false,
                    errors: err
                });
            },
            req.params.voteType,
            mongoose.Types.ObjectId(req.params.voteTypeId),
            mongoose.Types.ObjectId(req.session.passport.user._id)
            ,
            function (vote) {
                res.status(200).json({
                    result: true, vote: vote
                });
            }
        );
    });

router.get('/votes/:voteType/id/:voteTypeId/documents', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {

        if (!helper.checkRequiredParams(req.params, ['voteType', 'voteTypeId'], function (err) {
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
            req.params.voteType,
            mongoose.Types.ObjectId(req.params.voteTypeId)
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
router.post('/votes/:voteType/id/:voteTypeId/:operation', helper.l2pAuth, helper.ensureAuthenticated,
    function (req, res, next) {
        var cat = new Controller();
  
        if (!helper.checkRequiredParams(req.params, ['voteType', 'voteTypeId', 'operation'], function (err) {
                helper.resReturn(err, res);
            }))return;

        var voteValue = 0;
        if (req.params.operation == 'down') {
            voteValue = -1;
        } else if (req.params.operation == 'up') {
            voteValue = 1;
        }

        //params: createdBy, voteType, voteTypeId, voteValue
        cat.insertVote(
            function (err) {
                helper.resReturn(err, res);
            },
            mongoose.Types.ObjectId(req.user._id),
            req.params.voteType,
            mongoose.Types.ObjectId(req.params.voteTypeId),
            voteValue,
            function (vote) {
                res.status(200).json({
                    result: true, vote: vote
                });
            }
        );
    });

module.exports = router;