var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var solutions = require(appRoot + '/modules/peerAssessment/solutions.controller.js');
var peerAssessment = require(appRoot + '/modules/peerAssessment/peerAssessment.controller.js');
var reviews = require(appRoot + '/modules/peerAssessment/reviews.controller.js');
var rubrics = require(appRoot + '/modules/peerAssessment/rubrics.controller.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var debug = require('debug')('cm:server');
var moment = require('moment');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var router = express.Router();
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');



/***************************************************************************/
/*********************************Rubrics***********************************/
/***************************************************************************/
/**
 * POST
 * create rubric
 */
router.post('/peerassessment/:courseId/rubrics',
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        console.log('dsadasdasdasdasd', req.body)

        var rubric = new rubrics();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);

        rubric.addRubric(
            function (err) {
                console.log(err);
                res.status(200).json({result: false, errors: [err.message]});
            },

            // parameters
            req.body,

            function () {
                res.status(200).json({result: true});
            }
        );
    });

/**
 * POST
 * update a rubric
 */
router.post('/peerassessment/:courseId/rubrics/:id', function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var rubric = new rubrics();
    req.body.userId = mongoose.Types.ObjectId(req.user._id);
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    req.body.rId = mongoose.Types.ObjectId(req.params.id);

    rubric.updateRubric(
        function(err){
            helper.resReturn(err, res);
        },
        req.body,
        function () {
            res.status(200).json({result: true});
        }
    )
})

/**
 * GET
 * fetch all rubrics
 */
router.get('/peerassessment/:courseId/rubrics', function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var rubric = new rubrics();
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    rubric.getRubrics(
        function (err) {
            helper.resReturn(err, res);
        },
        req.body,
        function (rubrics) {
            res.status(200).json({result: true, rubrics: rubrics});
        }
    )
})

/**
 * DELETE
 * delete a rubric
 */
router.delete('/peerassessment/:courseId/rubrics/:id', function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var rubric = new rubrics();
    req.body.userId = mongoose.Types.ObjectId(req.user._id);
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    req.body.rId = mongoose.Types.ObjectId(req.params.id);

    rubric.deleteRubric(
        function(err){
            helper.resReturn(err, res);
        },
        req.body,
        function () {
            res.status(200).json({result: true});
        }
    )
})


/***************************************************************************/
/*********************************Reviews***********************************/
/***************************************************************************/
/**
 * GET
 * fetches course students and peerreview solutions
 */
router.get('/peerassessment/:courseId/peerreviews/:pRId/reviews/new',
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        var sr = new reviews();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.reviewId = mongoose.Types.ObjectId(req.params.pRId);

        sr.populateReviewAssignmentData(
            function (err) {
                console.log(err);
                res.status(200).json({result: false, errors: [err.message]});
            },

            // parameters
            req.body,

            function (users, solutions, assignedReviews) {
                res.status(200).json({result: true, users: users, solutions: solutions, assignedReviews: assignedReviews});
            }
        );
    });

/**
 * POST
 * assign review
 */
router.post('/peerassessment/:courseId/peerreviews/:pRId/reviews/assign',
    function(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.reviewId = mongoose.Types.ObjectId(req.params.pRId);
        if(req.body.assignedTo)
            req.body.assignedTo = mongoose.Types.ObjectId(req.body.assignedTo);
        if(req.body.solutionId)
            req.body.solutionId = mongoose.Types.ObjectId(req.body.solutionId);

        var sr = new reviews();
        sr.assignReview(
            function(err) {
                debug('Review:: Assignment =>', err);
                res.status(200).json({result: false, errors: [err.message]});
            },
            // parameters
            req.body,

            function () {
                res.status(200).json({result: true});
            }
        )
    });

/**
 * POST
 * add review
 */
router.post('/peerassessment/:courseId/peerreviews/:pRId/reviews/add',
    multipartyMiddleware,
    function(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.reviewId = mongoose.Types.ObjectId(req.params.pRId);
        if(req.body.solutionId)
            req.body.solutionId = mongoose.Types.ObjectId(req.body.solutionId);

        debug('Request Body =>', req.body)
        var sr = new reviews();
        sr.addReview(
            function(err) {
                console.log(err);
                res.status(200).json({result: false, errors: [err.message]});
            },
            // parameters
            req.body,
            req.files,

            function () {
                res.status(200).json({result: true});
            }
        )
    });

/**
 * PUT
 * update review
 */
router.put('/peerassessment/:courseId/reviews/:id',
    multipartyMiddleware,
    function(req, res) {
        console.log('PUT INVOKED')
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.reviewId = mongoose.Types.ObjectId(req.params.id);

        var sr = new reviews();
        sr.editReview(
            function(err) {
                console.log(err);
                res.status(200).json({result: false, errors: [err.message]});
            },
            // parameters
            req.body,
            req.files,

            function (reviewId) {
                res.status(200).json({result: true, reviewId: reviewId});
            }
        )
    });

/**
 * DELETE
 * delete review
 */
router.delete('/peerassessment/:courseId/peerreviews/:pRId/reviews/:id',
    function(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.reviewId = mongoose.Types.ObjectId(req.params.id);

        var sr = new reviews();
        sr.deleteReview(
            function(err) {
                res.status(200).json({result: false, errors: [err.message]});
            },
            // parameters
            req.body,

            function () {
                res.status(200).json({result: true});
            }
        )
    });

/**
 * GET
 * fetch all reviews
 */
router.get('/peerassessment/:courseId/reviews', async(function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    // For view Feedback page
    if(req.query.rName == 'VFCFetchReviews') {
        if(req.query.peerReviewId) {
            req.body.peerReviewId = mongoose.Types.ObjectId(req.query.peerReviewId)
            req.body.submittedBy = mongoose.Types.ObjectId(req.user._id)
            req.body.isSubmitted = true
        }
    }
    // For admin Feedback page
    if(req.query.rName == 'AFCFetchPeerReviews') {
        if(req.query.solutionId)
            req.body.solutionId = mongoose.Types.ObjectId(req.query.solutionId)
        if(req.query.isAdminReview) {
            switch((req.query.isAdminReview).toLowerCase().trim()) {
                case "true": case "yes": case "1": req.body.isAdminReview = true; break;
                case "false": case "no": case "0": case null: req.body.isAdminReview = false; break;
                default: req.body.isAdminReview = Boolean(req.query.isAdminReview);
            }
        }
        if(req.body.isAdminReview == true) {
            req.body.assignedTo = mongoose.Types.ObjectId(req.user._id)
        }
        if(req.query.isSubmitted && req.body.isAdminReview == false)
            req.body.isSubmitted = Boolean(req.query.isSubmitted)
    }

    // for lists in Assigned reviews section
    if(req.query.rName == 'RCRequestData') {
        var isAdmin = await(userHelper.isCourseAuthorizedAsync({userId: req.user._id, courseId: req.params.courseId}))
        if (!isAdmin && !req.query.peerReviewId) {
            req.body.assignedTo = mongoose.Types.ObjectId(req.user._id)
        } else  {
            req.body.isAdminReview = false
        }
    }
    debug('Request body =>', req.body)
    var sr = new reviews();
    sr.getReviews(
        function (err) {
            helper.resReturn(err, res);
        },
        req.body,
        function (reviews) {
            var now = new Date()
            if(req.query.rName == 'RCRequestData') {
                // Admin Assigned Review List might need some changes here
                reviews = _.each(reviews, function(review) {
                    var reviewSettings = review.peerReviewId.reviewSettings
                    if(reviewSettings.loop == 'multiple') {
                        if(now >= reviewSettings.reviewStartDate && now < reviewSettings.reviewEndDate) {
                            review.loop = 'First'
                        } else {
                            review.loop = 'Second'
                        }
                    }
                    debug(review, review.loop)
                })

                filteredReviews = _.filter(reviews, function(review) {
                    var filter = false
                    var reviewSettings = review.peerReviewId.reviewSettings
                    if((now > reviewSettings.reviewStartDate && now < reviewSettings.reviewEndDate) || (reviewSettings.loop == 'multiple' && now > reviewSettings.secondReviewStartDate && now < reviewSettings.secondReviewEndDate )) {
                        filter = true
                    }
                    return filter
                })
                reviews = filteredReviews
            }
            if(req.query.rName == 'VFCFetchReviews') {
                if(reviews && reviews.length) {
                    var pr = reviews[0].peerReviewId
                    if(now<pr.reviewSettings.reviewEndDate) {
                        reviews = []
                    }
                }
            }
            res.status(200).json({result: true, reviews: reviews});
        }
    )
}))

/**
 * GET
 * fetch review
 */
router.get('/peerassessment/:courseId/reviews/:id', async(function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    req.body._id = mongoose.Types.ObjectId(req.params.id)
    var isAdmin = await(userHelper.isCourseAuthorizedAsync({userId: req.user._id, courseId: req.params.courseId}))
    if (!isAdmin) {
        req.body.assignedTo = mongoose.Types.ObjectId(req.user._id)
    }
    var sr = new reviews();
    sr.getReview(
        function (err) {
            helper.resReturn(err, res);
        },
        req.body,
        function (review) {
            res.status(200).json({result: true, review: review});
        }
    )
}))
/***************************************************************************/
/*********************************Solutions*********************************/
/***************************************************************************/
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

/**
 * GET
 * fetch all solutions
 */
router.get('/peerassessment/:courseId/solutions', function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var rs = new solutions();
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    rs.getSolutions(
        function (err) {
            helper.resReturn(err, res);
        },
        req.body,
        function (solutions) {
            res.status(200).json({result: true, solutions: solutions});
        }
    )
})

/**
 * GET
 * get solution
 */
router.get('/peerassessment/:courseId/solutions/:id',
    function (req, res, next) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }

        var rs = new solutions();
        req.body.userId = mongoose.Types.ObjectId(req.user._id);
        req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
        req.body.sId = mongoose.Types.ObjectId(req.params.id);

        var params = {
            _id: mongoose.Types.ObjectId(req.params.id)
        }
        rs.getSolutionWithLean(
            function (err) {
                console.log(err);
                // res.status(200).json({result: false, errors: [err.message]});
                helper.resReturn(err, res);
            },

            // parameters
            params,

            function (solution) {
                res.status(200).json({result: true, solution: solution});
            }
        );
    });

/**
 * DELETE
 * delete a solution
 */
router.delete('/peerassessment/:courseId/solutions/:id', function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var rs = new solutions();
    req.body.userId = mongoose.Types.ObjectId(req.user._id);
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    req.body.sId = mongoose.Types.ObjectId(req.params.id);

    rs.deleteSolution(
        function(err){
            helper.resReturn(err, res);
        },
        req.body,
        function () {
            res.status(200).json({result: true});
        }
    )
})
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

            async(function (peerReview) {
                var isAdmin = await(userHelper.isCourseAuthorizedAsync({userId: req.user._id, courseId: req.params.courseId}))
                if (!isAdmin) {
                    var now = new Date()
                    if (!peerReview.solutionPublicationDate || now < peerReview.solutionPublicationDate ) {
                        peerReview = peerReview.toObject()
                        delete peerReview.solutions
                    }
                    debug(peerReview)
                }
                res.status(200).json({result: true, peerReview: peerReview});
            })
        );
    });

/**
 * GET
 * fetch all peer reviews
 */
router.get('/peerassessment/:courseId/peerreviews', async(function(req, res) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }

    var pa = new peerAssessment();
    req.body.courseId = mongoose.Types.ObjectId(req.params.courseId);
    var isAdmin = await(userHelper.isCourseAuthorizedAsync({userId: req.user._id, courseId: req.params.courseId}))
    if (!isAdmin) {
        req.body.publicationDate = {"$lte": new Date()}
    }
    pa.getPeerReviews(
        function (err) {
            helper.resReturn(err, res);
        },
        req.body,
        function (peerreviews) {
            res.status(200).json({result: true, peerreviews: peerreviews});
        }
    )
}))

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