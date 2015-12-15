var debug = require('debug')('cm:server');
var NewsfeedAgg = require('./models/newsfeed.model.js');
var Votes = require('../../votes/models/votes.js');
var SubTopics = require('../../trees/treeNodes.js');
var Posts = require('../../discussion/models/posts.js');
var Courses = require('../../catalogs/courses.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var PdfAnnotationZone = require('../../annotationZones/annotationZones.js');
var VideoAnnotation = require('../../annotations/models/video-annotation.js');
var Resources = require('../../trees/resources.js');
var Links = require('../../links/models/links.js');
//var Discussions = require('../../discussion/models/courseDiscussions.js');
var UserCourses = require('../../catalogs/userCourses.js');

var NewsfeedListener = {

    //Listener for Courses
    onAfterCourseCreated: function (newCourse) {
        Courses.findOne({_id: newCourse._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc._id;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "course",
                                actionName : doc.name,
                                courseId: courseId,
                                actionType: "created",
                                dateAdded: doc.dateAdded
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    onAfterCourseEdited: function (editCourse) {
        Courses.findOne({_id: editCourse._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc._id;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "course",
                                actionName : doc.name,
                                courseId: courseId,
                                actionType: "edited",
                                dateAdded: doc.dateUpdated
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    //Listener for Votes
    onAfterVoted: function (newVote) {
        Votes.findOne({_id: newVote._id})
            .exec(function (err, doc) {
                if (doc) {
                    var postId = doc.voteTypeId;
                    var voteType = doc.voteType;
                    var voteValue = "";
                    if (doc.voteValue == 1) {
                        voteValue = "up vote";
                    } else if (doc.voteValue == -1) {
                        voteValue = "down vote";
                    } else {
                        voteValue = "cancel vote";
                    }
                    if (voteType == "discussion"|| "discussionReply") {

                        Posts.findOne({_id: postId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.course;
                                    var postName = result.title;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: newVote.createdBy,
                                                actionSubjectIds: postId,
                                                actionSubject: voteValue,
                                                actionName: postName,
                                                courseId: courseId,
                                                actionType: "added",
                                                dateAdded: newVote.dateUpdated
                                            }
                                        );
                                        nf.save(
                                            function (err, doc) {
                                                if (!err) debug('');
                                                else
                                                    debug(err);
                                            }
                                        );
                                    } else {
                                        if (result.parentPost) {
                                            Posts.findOne({_id: result.parentPost})
                                                .exec(function (err, parentResult) {
                                                    if (parentResult) {
                                                        var nf = new NewsfeedAgg(
                                                            {
                                                                userId: newVote.createdBy,
                                                                actionSubjectIds: postId,
                                                                actionSubject: voteValue,
                                                                actionName: parentResult.title,
                                                                courseId: parentResult.course,
                                                                actionType: "added",
                                                                dateAdded: newVote.dateUpdated
                                                            }
                                                        );
                                                        nf.save(
                                                            function (err, doc) {
                                                                if (!err) debug('');
                                                                else
                                                                    debug(err);
                                                            }
                                                        );
                                                    }
                                                })
                                        }
                                    }


                                }
                            })
                    }

                }
            });

    },

    //Listener for Treenodes - Subtopics
    onAfterSubTopicCreated: function (newSubTopic) {
        SubTopics.findOne({_id: newSubTopic._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "sub topic",
                                actionName : doc.name,
                                courseId: courseId,
                                actionType: "created",
                                dateAdded: doc.dateAdded
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    onAfterSubTopicEdited: function (editSubTopic) {
        SubTopics.findOne({_id: editSubTopic._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "sub topic",
                                actionName : doc.name,
                                courseId: courseId,
                                actionType: "edited",
                                dateAdded: doc.dateUpdated
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    //Listener for Treenodes - Content Node
    onAfterContentNodeCreated: function (newContentNode) {
        SubTopics.findOne({_id: newContentNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "content node",
                                actionName: doc.name,
                                courseId: courseId,
                                actionType: "created",
                                dateAdded: doc.dateAdded
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    onAfterContentNodeEdited: function (editContentNode) {
        SubTopics.findOne({_id: editContentNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "content node",
                                actionName: doc.name,
                                courseId: courseId,
                                actionType: "edited",
                                dateAdded: doc.dateUpdated
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    //Listener for Treenodes - Node (whats different with subtopics?)
    onAfterNodeEdited: function (editNode) {
        SubTopics.findOne({_id: editNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "node",
                                actionName: doc.name,
                                courseId: courseId,
                                actionType: "edited",
                                dateAdded: doc.dateUpdated
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    onAfterNodeDeleted: function (deleteNode) {
        SubTopics.findOne({_id: deleteNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "node",
                                actionName: doc.name,
                                courseId: courseId,
                                actionType: "deleted",
                                dateAdded: doc.dateUpdated
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    //Listener for PDF
    onAfterPdfAnnotationCreated: function (newPdfAnnotation) {
        PdfAnnotation.findOne({_id: newPdfAnnotation._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId){
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID,
                                                            actionSubjectIds: pdfId,
                                                            actionSubject: "pdf annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            actionType: "added",
                                                            dateAdded: doc.dateOfCreation
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else
                                                                debug(err);
                                                        }
                                                    );
                                                }

                                        })



                                    }

                                }
                            })
                    }
                }
            });

    },

    onAfterPdfReplyCreated: function (newPdfAnnotationReply) {
        PdfAnnotation.findOne({_id: newPdfAnnotationReply._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId){
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID,
                                                            actionSubjectIds: pdfId,
                                                            actionSubject: "pdf annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            actionType: "replied",
                                                            dateAdded: doc.dateOfCreation
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else
                                                                debug(err);
                                                        }
                                                    );
                                                }

                                            })



                                    }

                                }
                            })
                    }
                }
            });

    },

    onAfterAnnotationZonePdfCreated: function (newPdfAnnotationZone) {
        PdfAnnotationZone.findOne({_id: newPdfAnnotationZone._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId){
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var dateNow = Date.now();
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID,
                                                            actionSubjectIds: pdfId,
                                                            actionSubject: "pdf annotation zone",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            actionType: "created",
                                                            dateAdded: dateNow
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else
                                                                debug(err);
                                                        }
                                                    );
                                                }

                                            })



                                    }

                                }
                            })
                    }
                }
            });
    },

    onAfterAnnotationZonePdfEdited: function (editPdfAnnotationZone) {
        PdfAnnotationZone.findOne({_id: editPdfAnnotationZone._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId){
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var dateNow = Date.now();
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID,
                                                            actionSubjectIds: pdfId,
                                                            actionSubject: "pdf annotation zone",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            actionType: "edited",
                                                            dateAdded: dateNow
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else
                                                                debug(err);
                                                        }
                                                    );
                                                }

                                            })



                                    }

                                }
                            })
                    }
                }
            });
    },

    //Listener for Video
    onAfterVideoAnnotationCreated: function (newVideoAnnotation) {
        VideoAnnotation.findOne({_id:newVideoAnnotation})
            .exec(function(err, doc){
                if (doc) {
                var videoId = doc.video_id;
                if (videoId) {
                    Resources.findOne({_id:videoId})
                        .exec(function(err, result){
                            if (result) {
                                var treeNodeId = result.treeNodeId;
                                if (treeNodeId) {
                                    SubTopics.findOne({_id:treeNodeId})
                                        .exec(function(err, res){
                                            if (res) {
                                                var nf = new NewsfeedAgg(
                                                    {
                                                        userId: doc.authorID, //still wrong, author based on authorName, not authorId
                                                        actionSubjectIds: videoId,
                                                        actionSubject: "video annotation",
                                                        actionName: res.name,
                                                        courseId: result.courseId,
                                                        actionType: "added",
                                                        dateAdded: doc.date_created
                                                    }
                                                );
                                                nf.save(
                                                    function (err, doc) {
                                                        if (!err) debug('');
                                                        else
                                                            debug(err);
                                                    }
                                                );
                                            }
                                        })
                                }
                            }
                        })
                }
               }
            });
    },

    onAfterVideoAnnotationEdited: function (editVideoAnnotation) {
        VideoAnnotation.findOne({_id:editVideoAnnotation})
            .exec(function(err, doc){
                if (doc) {
                    var videoId = doc.video_id;
                    if (videoId) {
                        Resources.findOne({_id:videoId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID, //still wrong, author based on authorName, not authorId
                                                            actionSubjectIds: videoId,
                                                            actionSubject: "video annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            actionType: "edited",
                                                            dateAdded: doc.date_modified
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else
                                                                debug(err);
                                                        }
                                                    );
                                                }
                                            })
                                    }
                                }
                            })
                    }
                }
            });
    },

    onAfterVideoAnnotationDeleted: function (deleteVideoAnnotation) {
        VideoAnnotation.findOne({_id:deleteVideoAnnotation})
            .exec(function(err, doc){
                if (doc) {
                    var videoId = doc.video_id;
                    if (videoId) {
                        Resources.findOne({_id:videoId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID, //still wrong, author based on authorName, not authorId
                                                            actionSubjectIds: videoId,
                                                            actionSubject: "video annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            actionType: "deleted",
                                                            dateAdded: doc.date_modified
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else
                                                                debug(err);
                                                        }
                                                    );
                                                }
                                            })
                                    }
                                }
                            })
                    }
                }
            });
    },

    //Listener for Link
    onAfterLinkCreated: function (newLink) {
        Links.findOne({_id: newLink._id})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        SubTopics.findOne({_id:contentId})
                            .exec(function(err, result){
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: doc.createdBy,
                                                actionSubjectIds: doc.id,
                                                actionSubject: "link",
                                                actionName : doc.title,
                                                courseId:  courseId,
                                                actionType: "added",
                                                dateAdded: doc.dateAdded
                                            }
                                        );
                                        nf.save(
                                            function (err, doc) {
                                                if (!err) debug('');
                                                else
                                                    debug(err);
                                            }
                                        );
                                    }
                                }
                            })
                    }

                }
            });

    },

    onAfterLinkEdited: function (editLink) {
        Links.findOne({_id: editLink._id})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        SubTopics.findOne({_id:contentId})
                            .exec(function(err, result){
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: doc.createdBy,
                                                actionSubjectIds: doc.id,
                                                actionSubject: "link",
                                                actionName : doc.title,
                                                courseId:  courseId,
                                                actionType: "edited",
                                                dateAdded: doc.dateUpdated
                                            }
                                        );
                                        nf.save(
                                            function (err, doc) {
                                                if (!err) debug('');
                                                else
                                                    debug(err);
                                            }
                                        );
                                    }
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
                        SubTopics.findOne({_id:contentId})
                            .exec(function(err, result){
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: doc.createdBy,
                                                actionSubjectIds: doc.id,
                                                actionSubject: "link",
                                                actionName : doc.title,
                                                courseId:  courseId,
                                                actionType: "deleted",
                                                dateAdded: doc.dateUpdated
                                            }
                                        );
                                        nf.save(
                                            function (err, doc) {
                                                if (!err) debug('');
                                                else
                                                    debug(err);
                                            }
                                        );
                                    }
                                }
                            })
                    }

                }
            });

    },

    //Listener for Discussion
    onAfterDiscussionCreated: function (newDiscussion){
        Posts.findOne({_id: newDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "discussion",
                                actionName : doc.title,
                                courseId:  courseId,
                                actionType: "added",
                                dateAdded: doc.dateAdded
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    onAfterDiscussionEdited: function (editDiscussion){
        Posts.findOne({_id: editDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "discussion",
                                actionName : doc.title,
                                courseId:  courseId,
                                actionType: "edited",
                                dateAdded: doc.dateUpdated
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    onAfterDiscussionDeleted: function (deleteDiscussion){
        Posts.findOne({_id: deleteDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: doc.createdBy,
                                actionSubjectIds: doc.id,
                                actionSubject: "discussion",
                                actionName : doc.title,
                                courseId:  courseId,
                                actionType: "deleted",
                                dateAdded: doc.dateUpdated
                            }
                        );
                        nf.save(
                            function (err, doc) {
                                if (!err) debug('');
                                else
                                    debug(err);
                            }
                        );
                    }

                }
            });

    },

    //Listener when user enroll or leave course
    onAfterEnrollorLeaveCourse: function (userEnrollment){
    UserCourses.findOne({_id: userEnrollment._id})
        .exec(function (err, doc) {
            if (doc) {
                var userStatus = (doc.isEnrolled === true)? 'enrolled':'left';
                var curDate = Date.now();
                var courseId = doc.course;
                if (courseId) {
                    Courses.findOne({_id:courseId})
                        .exec(function(err, result){
                            if (result){
                                var nf = new NewsfeedAgg(
                                    {
                                        userId: doc.user,
                                        actionSubjectIds: doc.id,
                                        actionSubject: result.name,
                                        courseId:  courseId,
                                        actionType: userStatus,
                                        dateAdded: curDate
                                    }
                                );
                                nf.save(
                                    function (err, doc) {
                                        if (!err) debug('');
                                        else
                                            debug(err);
                                    }
                                );
                            }
                        })
                }

            }
        });

}

};

module.exports = NewsfeedListener;
