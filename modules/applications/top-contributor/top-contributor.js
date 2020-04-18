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
var LearningHub = require('../../learningHub/models/hub.js')
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
                                            totalCount: 1,
                                            isEnrolled: true
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
                                            totalCount: 1,
                                            isEnrolled: true
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
    //when user delete content node, increase counter depends on the user
    onAfterNodeDeleted: function (deleteNode, user) {

        TreeNodes.findOne({_id: deleteNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    var userId = user._id;
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
                                            totalCount: 1,
                                            isEnrolled: true
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
    
    //When user delete discussion, increase counter
    onAfterDiscussionDeleted: function (deleteDiscussion, user) {
        Posts.findOne({_id: deleteDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    var userId = user._id;
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
                                                        totalCount: 1,
                                                        isEnrolled: true
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

    //Listener for PDF, if deleted, increase counter
    onAfterPdfAnnotationDeleted: function (deletePdfAnnotation, user) {
        var userId = user._id;
        var pdfId = deletePdfAnnotation.pdfId;
        if (pdfId) {
            Resources.findOne({_id: pdfId})
                .exec(function (err, result) {
                    if (result) {
                        var condition = {
                            userId: userId,
                            courseId: result.courseId
                        }, update = {$inc: {totalCount: 1, countNodeActivity: 1}};
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
                                                        totalCount: 1,
                                                        isEnrolled: true
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
                var userId = doc.createdBy;
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        TreeNodes.findOne({_id: contentId})
                            .exec(function (err, result) {
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
                                                        totalCount: 1,
                                                        isEnrolled: true
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

    onAfterLearningHubLinkCreated: function (newExtRes) {
        LearningHub.posts.findOne({_id: newExtRes._id})
            .exec(function (err, doc) {
                var userId = doc.userId;
                if (doc) {
                    var contentId = doc.contentId;
                    if (contentId) {
                        TreeNodes.findOne({_id: contentId})
                            .exec(function (err, result) {
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
                                                        totalCount: 1,
                                                        isEnrolled: true
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
    onAfterLinkDeleted: function (deleteLink, user) {
        var userId = user._id;
        Links.findOne({_id: deleteLink.linkId})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        TreeNodes.findOne({_id: contentId})
                            .exec(function (err, result) {
                                //var userId = doc.authorId;
                                if (result) {
                                    var condition = {
                                        userId: userId,
                                        courseId: result.courseId
                                    }, update = {$inc: {totalCount: 1, countNodeActivity: 1}};
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
    },

    onAfterLearningHubLinkDeleted : function (deleteLink, user) {
        var userId = user._id;
        LearningHub.posts.findOne({postId: deleteLink.postId})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentId;
                    if (contentId) {
                        TreeNodes.findOne({_id: contentId})
                            .exec(function (err, result) {
                                //var userId = doc.authorId;
                                if (result) {
                                    var condition = {
                                        userId: userId,
                                        courseId: result.courseId
                                    }, update = {$inc: {totalCount: 1, countNodeActivity: 1}};
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
    },

    onAfterEnrollorLeaveCourse: function (userEnrollment) {
        UserCourses.findOne({_id: userEnrollment._id})
            .exec(function (err, doc){
                if (doc) {
                    var userStatus = doc.isEnrolled;
                    var userId = doc.user;
                    var courseId = doc.course;
                    TopContributorAgg.update({userId: userId, courseId: courseId}, {isEnrolled:userStatus}, {multi:true}).exec();
                }
            })
    }
};

module.exports = topContributorListener;