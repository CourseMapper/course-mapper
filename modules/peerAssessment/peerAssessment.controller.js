var config = require('config');
var PeerReview = require('./models/peerReview.js');
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

function peerAssessment() {

}

peerAssessment.prototype.deletePeerReview = function(error, params, success) {
    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        function (isAllowed) {
            if (isAllowed) {
                PeerReview.remove(
                    {_id: mongoose.Types.ObjectId(params.pRId)}
                ).exec(function(err, res){
                    if(!err) {
                        // Delete the documents here
                        success();
                    } else {
                        error(err);
                    }
                })

            } else {
                error(helper.createError401());
            }
        });
}

peerAssessment.prototype.getPeerReviews = function (error, params , success) {
    PeerReview.find(params).exec(function(err, docs) {
        if(!err) {
            success(docs);
        } else {
            error(err);
        }
    })
}

peerAssessment.prototype.addPeerReview = function (error, params, files, success) {
    var self = this;

    if (!helper.checkRequiredParams(params, ['title', 'totalMarks', 'courseId', 'userId'], error)) {
        return;
    }

    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        function (isAllowed) {
            if (isAllowed) {

                var peerReview = new PeerReview({
                    title: params.title,
                    createdBy: mongoose.Types.ObjectId(params.userId),
                    courseId: mongoose.Types.ObjectId(params.courseId),
                    description: params.description,
                    groupSubmission: params.groupSubmission,
                    totalMarks: params.totalMarks
                });

                if(params.publicationDate instanceof Date) {
                    _.extend(peerReview, { publicationDate: params.publicationDate });
                }
                if(params.dueDate instanceof Date) {
                    _.extend(peerReview, { dueDate: params.dueDate });
                }
                if(params.ssPublicationDate instanceof Date) {
                    _.extend(peerReview, { solutionPublicationDate: params.ssPublicationDate });
                }

                // peerReview.save();
                if(files && files.file) {
                    var reviewDocuments = null;
                    var sampleSolutions = null;
                    if(files.file.length == 2){
                        reviewDocuments = files.file[0].reviewDocuments
                        sampleSolutions = files.file[1].sampleSolutions
                    } else if (files.file.length == 1) {
                        if(files.file[0] && files.file[0].reviewDocuments) {
                            reviewDocuments = files.file[0].reviewDocuments
                        }
                        if(files.file[0] && files.file[0].sampleSolutions) {
                            sampleSolutions = files.file[0].sampleSolutions
                        }
                    }

                    if(reviewDocuments && reviewDocuments.constructor == Array) {
                        for (var i in reviewDocuments) {
                            var f = reviewDocuments[i];
                            self.saveResourceFile(error,
                                f,
                                'reviewDocument',
                                peerReview,
                                function(fn) {
                                    peerReview.documents.push(fn);
                                })
                        }
                        for (var i in sampleSolutions) {
                            var f = sampleSolutions[i];
                            self.saveResourceFile(error,
                                f,
                                'sampleSolution',
                                peerReview,
                                function(fn) {
                                    peerReview.solutions.push(fn);
                                })
                        }
                    }
                }
                console.log('Peer review', peerReview);
                peerReview.save(function (err, res) {
                    if (err) {
                        debug('failed saving new peerreview');
                        error(err);
                    }
                    else {
                        debug('peerreview saved successfully');
                        success();
                    }
                });
                // success();
            } else {
                error(helper.createError401());
            }
        });
}

peerAssessment.prototype.saveResourceFile = function (error, file, type, helper, success) {
    var fileType = ['pdf'];

    var extension = file.name.split('.');
    extension = extension[extension.length - 1].toLowerCase();

    if (fileType.indexOf(extension) < 0) {
        // extension not right
        error(new Error("File extension not right"));
    } else {
        var fn = '/pa/'+ helper.courseId +'/'+ helper.title+'/'+ type +'/'+ file.name;
        var dest = appRoot + fn;
        try {
            handleUpload(file, dest, true);

        } catch (ex) {
            error(new Error("Failed uploading"));
            return;
        }

        if (success) {
            success(fn);
        }
    }
}

module.exports = peerAssessment;