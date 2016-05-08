var config = require('config');
var Solution = require('./models/solutions.js');
var PeerReview = require('./models/peerReview.js');
var Review = require('./models/review.js')
var UserCourses = require('../catalogs/userCourses.js')
var appRoot = require('app-root-path');
var peerAssessment = require(appRoot + '/modules/peerAssessment/peerAssessment.controller.js');
var users = require('../accounts/users.js');
var mongoose = require('mongoose');
var debug = require('debug')('pa:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var _ = require('lodash');
var fs = require('fs-extra');

function reviews() {

}

reviews.prototype.populateReviewAssignmentData = function (error, params, success) {
    if (!helper.checkRequiredParams(params, ['courseId', 'reviewId'], error)) {
        return;
    }
    userCourses = []
    solutions = []
    users = []
    assignedReviews = []
    var populate = async(function(){
        userCourses = await(UserCourses.find({ course: params.courseId , isEnrolled: true }, {user: 1}).populate({path:'user', select: 'username'}).lean().exec(function (err, res) {
            if (err) error(err);
            else
                return res;
        }))

        users = await(_.pluck(userCourses, 'user'))

        solutions = await(Solution.find({ peerReviewId: params.reviewId }, {title: 1, studentName: 1}).lean().exec(function (err, res) {
            if (err) error(err);
            else
                return res;
        }))

        peerReview = await(PeerReview.findOne({_id: params.reviewId}, {reviewSettings: 1}).exec( function(err, res) {
            if(err) error(err);
            else
                return res;
        }))

        assignedReviews = await(Review.find({ peerReviewId: params.reviewId }, {solutionId: 1, assignedTo: 1, isSubmitted: 1}).populate('solutionId assignedTo').lean().exec(function(err, res) {
            if(err) {
                console.log(err);
            } else {
                // console.log('alreadyAssignedReviews', res)
                return res;
            }
        }))

        assignmentType = 'single';
        if(peerReview && peerReview.reviewSettings) {
            assignmentType = peerReview.reviewSettings.reviewAssignment;
        }

        if(assignmentType == 'single') {
            filteredSolutions = await(_.filter(solutions, function(solution) {
                var filter = true;
                _.each(assignedReviews, function(review) {
                    if(review.solutionId._id.equals(solution._id)){
                        filter = false;
                    }
                })
                return filter;
            }))
            solutions = filteredSolutions
        }
    })

    populate().then(function() {
        success(users, solutions, assignedReviews);
    })
}

reviews.prototype.getReviews = function(error, params, success) {
    Review.find(params).exec(function(err, docs) {
        if(err) {
            error(err)
        } else {
            success(docs)
        }
    })
}

reviews.prototype.addReview = function(error, params, success) {
    if (!helper.checkRequiredParams(params, ['courseId', 'reviewId', 'userId', 'solutionId', 'assignedTo'], error)) {
        return;
    }

    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        function (isAllowed) {
            if (isAllowed) {
                var review = new Review({
                    peerReviewId: params.reviewId,
                    courseId: params.courseId,
                    solutionId: params.solutionId,
                    assignedTo: params.assignedTo,
                    isSubmitted: false
                })

                review.save(function(err) {
                    if(err) {
                        debug('Failed creating new review')
                        error(err)
                    } else {
                        success()
                    }
                })
            } else {
                error(helper.createError401());
            }
        }
    )
}

reviews.prototype.deleteReview = function(error, params, success) {
    if (!helper.checkRequiredParams(params, ['courseId', 'reviewId', 'userId'], error)) {
        return;
    }
    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        function (isAllowed) {
            if (isAllowed) {
                Review.remove(
                    {_id: params.reviewId}
                ).exec(function(err){
                    if(!err) {
                        success();
                    } else {
                        error(err);
                    }
                })
            } else {
                error(helper.createError401());
            }
        }
    )
}

module.exports = reviews;