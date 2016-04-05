var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var solutions = require(appRoot + '/modules/peerAssessment/solutions.controller.js');
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
 * create solution
 */
router.post('/peerassessment/:courseId/peerreviews/:pRId/solutions',
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        var rs = new solutions();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.username = req.user.username;
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.reviewId = mongoose.Types.ObjectId(req.params.pRId);

        rs.addSolution(
            function (err) {
                console.log(err);
                res.status(200).json({result: false, errors: [err.message]});
            },

            // parameters
            req.body,

            function (solution, title) {
                res.status(200).json({result: true, solution: solution, title: title});
            }
        );
    });

/**
 * PUT
 * edit solution
 */
router.put('/peerassessment/:courseId/peerreviews/:pRId/solutions/:id',
    multipartyMiddleware,
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        var rs = new solutions();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.username = req.user.username;
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.reviewId = mongoose.Types.ObjectId(req.params.pRId);
        req.body.sId = mongoose.Types.ObjectId(req.params.id);

        rs.editSolution(
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
/***************************************************************************/
/*********************************PeerReviews*******************************/
/***************************************************************************/
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
 * PUT
 * edit peer review
 */
router.put('/peerassessment/:courseId/peerreviews/:id',
    multipartyMiddleware,
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }


        var pa = new peerAssessment();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.pRId = mongoose.Types.ObjectId(req.params.id);

        pa.editPeerReview(
            function (err) {
                console.log(err);
                // res.status(200).json({result: false, errors: [err.message]});
                helper.resReturn(err, res);
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
 * get peer review
 */
router.get('/peerassessment/:courseId/peerreviews/:id',
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        var pa = new peerAssessment();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.pRId = mongoose.Types.ObjectId(req.params.id);

        var params = {
            _id: mongoose.Types.ObjectId(req.params.id)
        }

        pa.getPeerReview(
            function (err) {
                console.log(err);
                // res.status(200).json({result: false, errors: [err.message]});
                helper.resReturn(err, res);
            },

            // parameters
            params,

            function (peerReview) {
                res.status(200).json({result: true, peerReview: peerReview});
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