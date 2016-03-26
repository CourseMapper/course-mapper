var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var peerAssessment = require(appRoot + '/modules/peerAssessment/peerAssessment.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var debug = require('debug')('pa:route');
var moment = require('moment');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var router = express.Router();
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

/**
 * POST
 * create peer review
 */
router.post('/peerassessment/:courseId/peerreviews',
    multipartyMiddleware,
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        var pa = new peerAssessment();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);

        pa.addPeerReview(
            function (err) {
                console.log(err);
                res.status(200).json({result: false, errors: [err.message]});
            },

            // parameters
            req.body,
            req.files,

            function () {
                res.status(200).json({result: true});
            }
        );
    });

/**
 * GET
 * fetch all peer reviews
 */
router.get('/peerassessment/:courseId/peerreviews', function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var pa = new peerAssessment();
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    pa.getPeerReviews(
        function (err) {
            helper.resReturn(err, res);
        },
        req.body,
        function (peerreviews) {
            res.status(200).json({result: true, peerreviews: peerreviews});
        }
    )
})

/**
 * DELETE
 * delete a peer review
 */
router.delete('/peerassessment/:courseId/peerreviews/:id', function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var pa = new peerAssessment();
    req.body.userId = mongoose.Types.ObjectId(req.user._id);
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    req.body.pRId = mongoose.Types.ObjectId(req.params.id);

    pa.deletePeerReview(
        function(err){
            helper.resReturn(err, res);
        },
        req.body,
        function (peerreview) {
            res.status(200).json({result: true});
        }
    )
})
module.exports = router;