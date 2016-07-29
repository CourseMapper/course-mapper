var config = require('config');
var PeerReview = require('./models/peerReview.js');
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
var moment = require('moment');
var solutions = require('./solutions.controller.js');;

function peerAssessment() {

}

peerAssessment.prototype.getPeerReview = function (error, params, success) {
    PeerReview.findOne(params)
        .exec(function (err, doc) {
            if (err) {
                error(err);
            } else {
                if (doc) {
                    success(doc);
                }
                else
                    error(helper.createError404('Peer Review'));
            }
        });
};

peerAssessment.prototype.deletePeerReview = function(error, params, success) {
    userHelper.isAuthorized(error,
        {
            userId: params.userId,
            courseId: params.courseId
        },

        async(function (isAllowed) {
            if (isAllowed) {
                console.log('Deleting peer review: ' + params.pRId)
                var sc = new solutions();
                await(sc.getSolutions(
                        function (err) {
                            error(err)
                        },
                        {peerReviewId: mongoose.Types.ObjectId(params.pRId)},
                        function (docs) {
                            _.each(docs, function(doc) {
                                sc.deleteSolution(
                                    function(err){
                                        error(err)
                                    },
                                    {
                                        userId: params.userId,
                                        courseId: params.courseId,
                                        sId: doc._id
                                    },
                                    function () {
                                        console.log("Solution successfully deleted: " + doc._id)
                                    })
                            })
                        }
                    ))
                PeerReview.findOne(
                    {_id: mongoose.Types.ObjectId(params.pRId)}
                ).exec(function(err, doc) {
                    if(!err) {
                        _.each(doc.documents, function(docPath) {
                            fs.unlink(appRoot + '/public/' + docPath, function(err) {
                                if(err) {
                                    debug(err);
                                }
                                debug("File deleted successfully");
                            });
                        })
                        _.each(doc.solutions, function(docPath) {
                            fs.unlink(appRoot + '/public/' + docPath, function(err) {
                                if(err) {
                                    debug(err);
                                }
                                debug("File deleted successfully");
                            });
                        })

                        PeerReview.remove(
                            {_id: mongoose.Types.ObjectId(params.pRId)}
                        ).exec(function(err, res){
                            if(!err) {
                                success();
                            } else {
                                error(err);
                            }
                        })
                    } else {
                        error(err);
                    }
                })
            } else {
                error(helper.createError401());
            }
        }));
}

peerAssessment.prototype.getPeerReviews = function (error, params , success) {
    PeerReview.find(params).sort({dateAdded: -1}).exec(function(err, docs) {
        if(!err) {
            success(docs);
        } else {
            error(err);
        }
    })
}

peerAssessment.prototype.editPeerReview = function (error, params, files, success) {
    var self = this;

    if (!helper.checkRequiredParams(params, ['title', 'totalMarks', 'courseId', 'userId', 'pRId'], error)) {
        return;
    }

    self.getPeerReview(error,
        {
            _id: params.pRId
        },

        function(peerReview) {
            userHelper.isAuthorized(error,
                {
                    userId: params.userId,
                    courseId: params.courseId
                },

                function (isAllowed) {
                    if (isAllowed) {

                        if(params.reviewSettings.rubrics) {
                            _.map(params.reviewSettings.rubrics, function(r) {
                                return mongoose.Types.ObjectId(r)
                            })
                        }

                        peerReview.title = params.title;
                        peerReview.description = params.reviewDescription;
                        peerReview.groupSubmission = params.groupSubmission;
                        peerReview.totalMarks = params.totalMarks;
                        peerReview.documents = params.documents || [];
                        peerReview.solutions = params.solutions || [];
                        peerReview.reviewSettings = params.reviewSettings;

                        debug(params)

                        if(params.publicationDate && params.publicationDate !== 'null' && moment(params.publicationDate).isValid()) {
                            _.extend(peerReview, { publicationDate: new Date(params.publicationDate) });
                        }
                        if(params.dueDate && params.dueDate !== 'null' && moment(params.dueDate).isValid()) {
                            _.extend(peerReview, { dueDate: new Date(params.dueDate) });
                        }
                        if(params.ssPublicationDate && params.ssPublicationDate !== null && moment(params.ssPublicationDate).isValid()) {
                            _.extend(peerReview, { solutionPublicationDate: new Date(params.ssPublicationDate) });
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
                                        function (fn) {
                                            var duplicate = false;
                                            _.each(peerReview.documents, function (doc) {
                                                if (fn == doc) {
                                                    duplicate = true;
                                                }
                                            })
                                            if (!duplicate) {
                                                peerReview.documents.push(fn);
                                            }
                                        })
                                }
                            }

                            if(sampleSolutions && sampleSolutions.constructor == Array) {
                                for (var i in sampleSolutions) {
                                    var f = sampleSolutions[i];
                                    self.saveResourceFile(error,
                                        f,
                                        'sampleSolution',
                                        peerReview,
                                        function(fn) {
                                            var duplicate = false;
                                            _.each(peerReview.solutions, function(doc){
                                                if(fn == doc) {
                                                    duplicate = true;
                                                }
                                            })
                                            if(!duplicate) {
                                                peerReview.solutions.push(fn);
                                            }
                                        })
                                }
                            }
                        }
                        // Files deletion should be performed here
                        console.log('Deleting files', params.deletedUploadedFiles);
                        _.each(params.deletedUploadedFiles, function(filePath) {
                            fs.unlink(appRoot + '/public/' + filePath, function(err) {
                                if(err) {
                                    debug(err);
                                }
                                debug("File deleted successfully");
                                console.log('File successfully deleted');
                            });
                        })

                        _.each(params.deletedUploadedSolutions, function(filePath) {
                            fs.unlink(appRoot + '/public/' + filePath, function(err) {
                                if(err) {
                                    debug(err);
                                }
                                debug("File deleted successfully");
                                console.log('File successfully deleted');
                            });
                        })

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
        });
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
                if(params.reviewSettings.rubrics) {
                    _.map(params.reviewSettings.rubrics, function(r) {
                        return mongoose.Types.ObjectId(r)
                    })
                }

                var peerReview = new PeerReview({
                    title: params.title,
                    createdBy: mongoose.Types.ObjectId(params.userId),
                    courseId: mongoose.Types.ObjectId(params.courseId),
                    description: params.reviewDescription,
                    groupSubmission: params.groupSubmission,
                    totalMarks: params.totalMarks,
                    reviewSettings: params.reviewSettings
                });

                if(params.publicationDate && params.publicationDate !== 'null' && moment(params.publicationDate).isValid()) {
                    _.extend(peerReview, { publicationDate: new Date(params.publicationDate) });
                }
                if(params.dueDate && params.dueDate !== 'null' && moment(params.dueDate).isValid()) {
                    _.extend(peerReview, { dueDate: new Date(params.dueDate) });
                }
                if(params.ssPublicationDate && params.ssPublicationDate !== null && moment(params.ssPublicationDate).isValid()) {
                    _.extend(peerReview, { solutionPublicationDate: new Date(params.ssPublicationDate) });
                }

                peerReview.save(function (err, peerReview) {
                    if (err) {
                        debug('failed saving new peerreview');
                        error(err);
                    }
                    else {
                        console.log('Doc', peerReview);
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
                                        function (fn) {
                                            var duplicate = false;
                                            _.each(peerReview.documents, function (doc) {
                                                if (fn == doc) {
                                                    duplicate = true;
                                                }
                                            })
                                            if (!duplicate) {
                                                peerReview.documents.push(fn);
                                            }
                                        })
                                }
                            }
                            if(sampleSolutions && sampleSolutions.constructor == Array) {
                                for (var i in sampleSolutions) {
                                    var f = sampleSolutions[i];
                                    self.saveResourceFile(error,
                                        f,
                                        'sampleSolution',
                                        peerReview,
                                        function(fn) {
                                            var duplicate = false;
                                            _.each(peerReview.solutions, function(doc){
                                                if(fn == doc) {
                                                    duplicate = true;
                                                }
                                            })
                                            if(!duplicate) {
                                                peerReview.solutions.push(fn);
                                            }
                                        })
                                }
                            }
                        }
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
                    }
                });
            } else {
                error(helper.createError401());
            }
        });
}

peerAssessment.prototype.saveResourceFile = function (error, file, type, helper, success) {
    //var fileType = ['pdf'];
    //
    //var extension = file.name.split('.');
    //extension = extension[extension.length - 1].toLowerCase();
    //
    //if (fileType.indexOf(extension) < 0) {
    //    // extension not right
    //    error(new Error("File extension not right"));
    //} else {
        var fn = '/pa/'+ helper.courseId +'/'+ helper._id+'/'+ type +'/'+ file.name;
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

module.exports = peerAssessment;