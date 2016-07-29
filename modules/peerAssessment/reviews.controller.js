var config = require('config');
var Solution = require('./models/solutions.js');
var PeerReview = require('./models/peerReview.js');
var Review = require('./models/review.js')
var UserCourses = require('../catalogs/userCourses.js')
var appRoot = require('app-root-path');
var users = require('../accounts/users.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:server');
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

        assignedReviews = await(Review.find({ peerReviewId: params.reviewId, isAdminReview: false, isSecondLoop: null }, {solutionId: 1, assignedTo: 1, isSubmitted: 1}).populate('solutionId assignedTo').lean().exec(function(err, res) {
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

            filteredUsers = await(_.filter(users, function(user) {
                var filter = true;
                _.each(assignedReviews, function(review) {
                    console.log(review)
                    if(review.assignedTo.username == user.username){
                        filter = false;
                    }
                })
                return filter;
            }))
            users = filteredUsers
        }
    })

    populate().then(function() {
        success(users, solutions, assignedReviews);
    })
}

reviews.prototype.getReviews = function(error, params, success) {
    Review.find(params).populate({
        path: 'peerReviewId',
        model: 'peerreviews',
        populate: {
            path: 'reviewSettings.rubrics',
            model: 'rubrics'
        }
    }).populate('assignedTo solutionId submittedBy').lean().exec(function(err, docs) {
        if(err) {
            error(err)
        } else {
            success(docs)
        }
    })
}

reviews.prototype.getReview = function(error, params, success) {
    Review.findOne(params)
        .populate({
            path: 'peerReviewId',
            model: 'peerreviews',
            select: 'totalMarks reviewSettings',
            populate: {
                path: 'reviewSettings.rubrics',
                model: 'rubrics'
            }
        }).populate({
            path: 'solutionId',
            model: 'solutions',
            select: 'title solutionDocuments studentComments studentName',
        }).lean().exec(function(err, doc) {
            if(err) {
                error(err)
            } else {
                console.log(doc)
                success(doc)
            }
    })
}

reviews.prototype.assignReview = function(error, params, success) {
    if (!helper.checkRequiredParams(params, ['courseId', 'reviewId', 'userId', 'solutionId', 'assignedTo'], error)) {
        return;
    }

    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        async(function (isAllowed) {
            if (isAllowed) {

                var solution = await(Solution.findOne({_id: params.solutionId}).exec())
                if(!solution) {
                    error(new Error('Invalid Solution'))
                }

                var review = new Review({
                    peerReviewId: params.reviewId,
                    courseId: params.courseId,
                    solutionId: params.solutionId,
                    isAdminReview: false,
                    assignedTo: params.assignedTo,
                    submittedBy: solution.createdBy,
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
        })
    )
}

reviews.prototype.addReview = function(error, params, files, success) {
    var self = this;
    if (!helper.checkRequiredParams(params, ['courseId', 'reviewId', 'userId', 'solutionId'], error)) {
        return;
    }

    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        async(function (isAllowed) {
            if (isAllowed) {

                var solution = await(Solution.findOne({_id: params.solutionId}).exec())
                if(!solution) {
                    error(new Error('Invalid Solution'))
                }

                var review = new Review({
                    peerReviewId: params.reviewId,
                    courseId: params.courseId,
                    solutionId: params.solutionId,
                    isAdminReview: true,
                    assignedTo: params.userId,
                    submittedBy: solution.createdBy,
                    isSubmitted: true,
                    comments : params.comments,
                    marksObtained : params.marksObtained,
                    documents : params.documents || []
                })

                if(files && files.file) {
                    var reviewDocuments = files.file[0].reviewDocuments
                    if(reviewDocuments && reviewDocuments.constructor == Array) {
                        for (var i in reviewDocuments) {
                            var f = reviewDocuments[i];
                            self.saveResourceFile(error,
                                f,
                                'review',
                                review,
                                function (fn) {
                                    var duplicate = false;
                                    _.each(review.documents, function (doc) {
                                        if (fn == doc) {
                                            duplicate = true;
                                        }
                                    })
                                    if (!duplicate) {
                                        review.documents.push(fn);
                                    }
                                })
                        }
                    }
                }
                _.each(params.deletedUploadedFiles, function(filePath) {
                    fs.unlink(appRoot + '/public/' + filePath, function(err) {
                        if(err) {
                            debug(err);
                        }
                        debug("File deleted successfully");
                    });
                })

                review.save(function (err, res) {
                    if (err) {
                        debug('failed saving new review');
                        error(err);
                    }
                    else {
                        debug('review saved successfully');
                        success();
                    }
                });
            } else {
                error(helper.createError401());
            }
        })
    )
}

var handleCopy = function(oldPath, destination, overwrite) {
    if(!overwrite)
        overwrite = false;

    fs.copy(oldPath, destination, {replace: overwrite}, function (err) {
        if (err) return debug(err);
        debug("success copied file");
    });
};

reviews.prototype.copyFile = function (error, filePath, type, helper, success) {
    var filePathPieces = filePath.split('/')
    var name = filePathPieces[filePathPieces.length - 1]
    var fn = '/pa/'+ helper.courseId +'/'+ helper.peerReviewId._id+'/'+ type +'/'+ helper._id +'/'+ name;
    var dest = appRoot + '/public/'+ fn;
    try {
        handleCopy(appRoot + '/public' + filePath, dest, true);
    } catch (ex) {
        error(new Error("Failed uploading"));
        return;
    }

    if (success) {
        success(fn);
    }
}

reviews.prototype.addSecondReview = function(error, params, oldReview, files, success) {
    var self = this
    var solution = await(Solution.findOne({_id: oldReview.solutionId}).exec())
    if(!solution) {
        error(new Error('Invalid Solution'))
    }
    var review = new Review({
        peerReviewId: oldReview.peerReviewId,
        courseId: oldReview.courseId,
        solutionId: oldReview.solutionId,
        isAdminReview: false,
        assignedTo: oldReview.assignedTo,
        submittedBy: oldReview.submittedBy,
        isSubmitted: true,
        comments : params.comments,
        marksObtained : params.marksObtained,
        //documents : params.documents || [],
        isSecondLoop : true,
        oldReviewId : oldReview._id,
        rubricReview : params.rubricReview
    })

    review.save(function (err, secondReview) {
        if (err) {
            debug('failed saving new review');
            error(err);
        } else {
            if(files && files.file) {
                var reviewDocuments = files.file[0].reviewDocuments
                if(reviewDocuments && reviewDocuments.constructor == Array) {
                    for (var i in reviewDocuments) {
                        var f = reviewDocuments[i];
                        self.saveResourceFile(error,
                            f,
                            'review',
                            secondReview,
                            function (fn) {
                                secondReview.documents.push(fn);
                            })
                    }
                }
            }
            // Copy the old review files if user keeps them
            if(params.documents && params.documents.length) {
                for (var i in params.documents) {
                    self.copyFile(error, params.documents[i], 'review', secondReview, function (fn) {
                        var duplicate = false;
                        _.each(secondReview.documents, function (doc) {
                            if (fn == doc) {
                                duplicate = true;
                            }
                        })
                        if (!duplicate) {
                            secondReview.documents.push(fn);
                        }
                    })
                }
            }
            secondReview.save()
            success(secondReview._id);
        }
    });
}

reviews.prototype.editReview = function(error, params, files, success) {
    var self = this;

    if (!helper.checkRequiredParams(params, ['courseId', 'reviewId', 'userId'], error)) {
        return;
    }

    Review.findOne({
        _id: params.reviewId
    }).populate('peerReviewId').exec(async(function(err, review) {
        var isAdmin = await(userHelper.isCourseAuthorizedAsync({userId: params.userId, courseId: params.courseId}))

        if ((review.assignedTo.toString != params.userId.toString) && !isAdmin) {
            debug("Unauthorized to perform this functionality");
            error(helper.createError401())
            return
            // Start working from here
            // Admin check should be added and review date as well
        }
        if(!isAdmin) {
            var now = new Date();
            var reviewSettings = review.peerReviewId.reviewSettings;
            var isReviewTime = false
            if((now > reviewSettings.reviewStartDate && now < reviewSettings.reviewEndDate) || (reviewSettings.loop == 'multiple' && now > reviewSettings.secondReviewStartDate && now < reviewSettings.secondReviewEndDate )) {
                isReviewTime = true
            }
            if(!isReviewTime) {
                var err = new Error('Deadline has passed. Cannot submit review now')
                error(err)
                return
            }
            if(reviewSettings.loop == 'multiple' && now > reviewSettings.secondReviewStartDate && now < reviewSettings.secondReviewEndDate) {
                // Creating another record for 2nd loop
                if(!review.isSecondLoop) {
                    self.addSecondReview(error, params, review, files, success)
                    return
                }
            }
        }
        review.comments = params.comments
        review.marksObtained = params.marksObtained
        review.documents = params.documents || []
        review.rubricReview = params.rubricReview
        review.isSubmitted = true

        //console.log(review)
        //console.log('Review files', files)
        if(files && files.file) {
            var reviewDocuments = files.file[0].reviewDocuments
            if(reviewDocuments && reviewDocuments.constructor == Array) {
                for (var i in reviewDocuments) {
                    var f = reviewDocuments[i];
                    self.saveResourceFile(error,
                        f,
                        'review',
                        review,
                        function (fn) {
                            var duplicate = false;
                            _.each(review.documents, function (doc) {
                                if (fn == doc) {
                                    duplicate = true;
                                }
                            })
                            if (!duplicate) {
                                review.documents.push(fn);
                            }
                        })
                }
            }
        }
        _.each(params.deletedUploadedFiles, function(filePath) {
            fs.unlink(appRoot + '/public/' + filePath, function(err) {
                if(err) {
                    debug(err);
                }
                debug("File deleted successfully");
            });
        })
        review.save(function (err, res) {
            if (err) {
                debug('failed saving new review');
                error(err);
            }
            else {
                debug('review saved successfully');
                success(res._id);
            }
        });
    }))
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
                console.log('Deleting Review: ' + params.reviewId)
                Review.find({
                    $or: [{_id: params.reviewId}, {oldReviewId: params.reviewId}]
                }).exec(function(err, reviews) {
                    if(err) { error(err) }
                    _.each(reviews, function(review) {
                        debug('RID: ', review._id)
                        _.each(review.documents, function(docPath) {
                            debug('Path: ', docPath)
                            fs.unlink(appRoot + '/public' + docPath, function(err) {
                                if(err) {
                                    debug(err);
                                }
                                debug("File deleted successfully");
                            });
                        })
                        review.remove()
                    })
                    success()
                })
            } else {
                error(helper.createError401());
            }
        }
    )
}

reviews.prototype.saveResourceFile = function (error, file, type, helper, success) {
    //var fileType = ['pdf'];
    //
    //var extension = file.name.split('.');
    //extension = extension[extension.length - 1].toLowerCase();
    //
    //if (fileType.indexOf(extension) < 0) {
    //    // extension not right
    //    error(new Error("File extension not right"));
    //} else {
        var fn = '/pa/'+ helper.courseId +'/'+ helper.peerReviewId._id+'/'+ type +'/'+ helper._id +'/'+ file.name;
        var dest = appRoot + '/public/'+ fn;
        try {
            handleUpload(file, dest, true);

        } catch (ex) {
            error(new Error("Failed uploading"));
            return;
        }

        if (success) {
            success(fn);
        }
    //}
}

module.exports = reviews;