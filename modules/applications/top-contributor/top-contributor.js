//listener for top contributor activity

var debug = require('debug')('cm:server');
//var TopContentAgg = require('../top-content/models/topContent.model.js');
var TopContributorAgg = require('./models/topContributor.model.js');
var TreeNodes = require('../../trees/treeNodes.js');
var Posts = require('../../discussion/models/posts.js');
var Courses = require('../../catalogs/courses.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var PdfAnnotationZone = require('../../annotationZones/annotationZones.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var Resources = require('../../trees/resources.js');
var Links = require('../../links/models/links.js');
//var Discussions = require('../../discussion/models/courseDiscussions.js');
var UserCourses = require('../../catalogs/userCourses.js');


var topContributorListener = {

    //When user add content, increase counter
    onAfterContentNodeCreated: function (newContentNode) {
        TreeNodes.findOne({_id: newContentNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    var userId = doc.createdBy;
                    if (courseId) {
                        var condition = {userId: userId, courseId: courseId}, update = {
                            $inc: {
                                totalCount: 1,
                                countCourseActivity: 1
                            }
                        };
                        TopContributorAgg.findOne(condition)
                            .exec(function (err, resTC) {
                                if (resTC) {
                                    TopContributorAgg.update(condition, update).exec();
                                }
                                else {
                                    var nf = new TopContributorAgg(
                                        {
                                            userId: userId,
                                            courseId: courseId,
                                            countCourseActivity: 1,
                                            countNodeActivity: 0,
                                            totalCount: 1
                                        }
                                    );
                                    nf.save(
                                        function (err, docs) {
                                            if (!err) debug('');
                                            else
                                                debug(err);
                                        }
                                    );
                                }
                            });

                    }

                }
            });

    },
    //When user add subtopic, increase counter
    onAfterSubTopicCreated: function (newSubtopicNode) {
        TreeNodes.findOne({_id: newSubtopicNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    var userId = doc.createdBy;
                    if (courseId) {
                        var condition = {userId: userId, courseId: courseId}, update = {
                            $inc: {
                                totalCount: 1,
                                countCourseActivity: 1
                            }
                        };
                        TopContributorAgg.findOne(condition)
                            .exec(function (err, resTC) {
                                if (resTC) {
                                    TopContributorAgg.update(condition, update).exec();
                                }
                                else {
                                    var nf = new TopContributorAgg(
                                        {
                                            userId: userId,
                                            courseId: courseId,
                                            countCourseActivity: 1,
                                            countNodeActivity: 0,
                                            totalCount: 1
                                        }
                                    );
                                    nf.save(
                                        function (err, docs) {
                                            if (!err) debug('');
                                            else
                                                debug(err);
                                        }
                                    );
                                }
                            });

                    }

                }
            });

    },
    //when user delete content node, decrease counter
    onAfterNodeDeleted: function (deleteNode) {

        TreeNodes.findOne({_id: deleteNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    var userId = doc.createdBy;
                    if (courseId) {
                        var condition = {userId: userId, courseId: courseId}, update = {
                            $inc: {
                                totalCount: -1,
                                countCourseActivity: -1
                            }
                        };
                        TopContributorAgg.findOne(condition)
                            .exec(function (err, resTC) {
                                if (resTC) {
                                    TopContributorAgg.update(condition, update).exec();
                                }
                                else {
                                    console.log('could not find document');
                                }
                            });

                    }

                }
            });

    },

    //discussion
    //When user add discussion, increase counter
    onAfterDiscussionCreated: function (newDiscussion) {
        Posts.findOne({_id: newDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    var userId = doc.createdBy;
                    if (courseId) {
                        var condition = {userId: userId, courseId: courseId}, update = {
                            $inc: {
                                totalCount: 1,
                                countCourseActivity: 1
                            }
                        };
                        TopContributorAgg.findOne(condition)
                            .exec(function (err, resTC) {
                                if (resTC) {
                                    TopContributorAgg.update(condition, update).exec();
                                }
                                else {
                                    var nf = new TopContributorAgg(
                                        {
                                            userId: userId,
                                            courseId: courseId,
                                            countCourseActivity: 1,
                                            countNodeActivity: 0,
                                            totalCount: 1
                                        }
                                    );
                                    nf.save(
                                        function (err, docs) {
                                            if (!err) debug('');
                                            else
                                                debug(err);
                                        }
                                    );
                                }
                            });

                    }

                }
            });

    },
    
    //When user delete discussion, decrease counter
    onAfterDiscussionDeleted: function (newDiscussion) {
        Posts.findOne({_id: newDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    var userId = doc.createdBy;
                    if (courseId) {
                        var condition = {userId: userId, courseId: courseId}, update = {
                            $inc: {
                                totalCount: -1,
                                countCourseActivity: -1
                            }
                        };
                        TopContributorAgg.findOne(condition)
                            .exec(function (err, resTC) {
                                if (resTC) {
                                    TopContributorAgg.update(condition, update).exec();
                                }
                                else {
                                    console.log('could not find document');
                                }
                            });

                    }

                }
            });

    },

    //Listener for PDF, if created, increase counter
    onAfterPdfAnnotationCreated: function (newPdfAnnotation) {
        PdfAnnotation.findOne({_id: newPdfAnnotation._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function (err, result) {
                                if (result) {
                                    var condition = {
                                        userId: doc.authorID,
                                        courseId: result.courseId
                                    }, update = {$inc: {totalCount: 1, countNodeActivity: 1}};
                                    TopContributorAgg.findOne(condition)
                                        .exec(function (err, resTC) {
                                            if (resTC) {
                                                TopContributorAgg.update(condition, update).exec();
                                            }
                                            else {
                                                var nf = new TopContributorAgg(
                                                    {
                                                        userId: doc.authorID,
                                                        courseId: result.courseId,
                                                        countCourseActivity: 0,
                                                        countNodeActivity: 1,
                                                        totalCount: 1
                                                    }
                                                );
                                                nf.save(
                                                    function (err, docs) {
                                                        if (!err) debug('');
                                                        else
                                                            debug(err);
                                                    }
                                                );
                                            }
                                        });
                                }
                            })
                    }
                }
            });

    },

    /*TODO: Zuhra, fix this since the find function search for notexisted document due to deletation of document*/
    //Listener for PDF, if deleted, decrease counter
    onAfterPdfAnnotationDeleted: function (newPdfAnnotation) {
        PdfAnnotation.findOne({_id: newPdfAnnotation._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function (err, result) {
                                if (result) {
                                    var condition = {
                                        userId: doc.authorID,
                                        courseId: result.courseId
                                    }, update = {$inc: {totalCount: -1, countNodeActivity: -1}};
                                    TopContributorAgg.findOne(condition)
                                        .exec(function (err, resTC) {
                                            if (resTC) {
                                                TopContributorAgg.update(condition, update).exec();
                                            }
                                            else {
                                                console.log('cannot find document');
                                            }
                                        });
                                }
                            })
                    }
                }
            });

    },

    //Listener for Video
    onAfterVideoAnnotationCreated: function (newVideoAnnotation) {
        VideoAnnotation.findOne({_id: newVideoAnnotation})
            .exec(function (err, doc) {
                if (doc) {
                    var videoId = doc.video_id;
                    if (videoId) {
                        Resources.findOne({_id: videoId})
                            .exec(function (err, result) {
                                var userId = doc.authorId;
                                var courseId = result.courseId;
                                if (result) {
                                    var condition = {
                                        userId: userId,
                                        courseId: courseId
                                    }, update = {$inc: {totalCount: 1, countNodeActivity: 1}};
                                    TopContributorAgg.findOne(condition)
                                        .exec(function (err, resTC) {
                                            if (resTC) {
                                                TopContributorAgg.update(condition, update).exec();
                                            }
                                            else {
                                                var nf = new TopContributorAgg(
                                                    {
                                                        userId: userId,
                                                        courseId: courseId,
                                                        countCourseActivity: 0,
                                                        countNodeActivity: 1,
                                                        totalCount: 1
                                                    }
                                                );
                                                nf.save(
                                                    function (err, docs) {
                                                        if (!err) debug('');
                                                        else
                                                            debug(err);
                                                    }
                                                );
                                            }
                                        });
                                }
                            })
                    }
                }
            });
    },

    //when user delete video annotation, decrease counter
    onAfterVideoAnnotationDeleted: function (deleteVideoAnnotation, user) {
        var videoId = deleteVideoAnnotation.video_id;
        var userId = user;
        Resources.findOne({_id: videoId})
            .exec(function (err, result) {
                //var userId = doc.authorId;
                var courseId = result.courseId;
                if (result) {
                    var condition = {
                        userId: userId,
                        courseId: courseId
                    }, update = {$inc: {totalCount: -1, countNodeActivity: -1}};
                    TopContributorAgg.findOne(condition)
                        .exec(function (err, resTC) {
                            if (resTC) {
                                TopContributorAgg.update(condition, update).exec();
                            }
                            else {
                                console.log('No document fount');
                            }
                        });
                }
            })

    },

    //Listener for Link
    onAfterLinkCreated: function (newLink) {
        Links.findOne({_id: newLink._id})
            .exec(function (err, doc) {
                //var linkId = doc.
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        TreeNodes.findOne({_id: contentId})
                            .exec(function (err, result) {
                                var userId = doc.authorId;
                                var courseId = result.courseId;
                                if (result) {
                                    var condition = {
                                        userId: userId,
                                        courseId: courseId
                                    }, update = {$inc: {totalCount: 1, countNodeActivity: 1}};
                                    TopContributorAgg.findOne(condition)
                                        .exec(function (err, resTC) {
                                            if (resTC) {
                                                TopContributorAgg.update(condition, update).exec();
                                            }
                                            else {
                                                var nf = new TopContributorAgg(
                                                    {
                                                        userId: userId,
                                                        courseId: courseId,
                                                        countCourseActivity: 0,
                                                        countNodeActivity: 1,
                                                        totalCount: 1
                                                    }
                                                );
                                                nf.save(
                                                    function (err, docs) {
                                                        if (!err) debug('');
                                                        else
                                                            debug(err);
                                                    }
                                                );
                                            }
                                        });
                                }
                            })
                    }

                }
            });

    },

    onAfterLinkDeleted: function (deleteLink) {
        Links.findOne({_id: deleteLink._id})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        TreeNodes.findOne({_id: contentId})
                            .exec(function (err, result) {
                                var userId = doc.authorId;
                                if (result) {
                                    var condition = {
                                        userId: userId
                                    }, update = {$inc: {totalCount: -1, countNodeActivity: -1}};
                                    TopContributorAgg.findOne(condition)
                                        .exec(function (err, resTC) {
                                            if (resTC) {
                                                TopContributorAgg.update(condition, update).exec();
                                            }
                                            else {
                                                console.log('document not found');
                                            }
                                        });
                                }
                            })
                    }

                }
            });
    }
};

module.exports = topContributorListener;