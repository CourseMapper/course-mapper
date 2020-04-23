var debug = require('debug')('cm:server');
var NewsfeedAgg = require('./models/newsfeed.model.js');
var Votes = require('../../votes/models/votes.js');
var SubTopics = require('../../trees/treeNodes.js');
var Posts = require('../../discussion/models/posts.js');
var Courses = require('../../catalogs/courses.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var PdfAnnotationZone = require('../../annotationZones/annotationZones.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var Resources = require('../../trees/resources.js');
var Links = require('../../links/models/links.js');
var ExtResources = require('../../learningHub/models/hub.js');
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

    onAfterCourseEdited: function (editCourse, params) {
        Courses.findOne({_id: editCourse._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc._id;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: params.userId,
                                actionSubjectIds: doc.id,
                                actionSubject: "course",
                                actionName: doc.name,
                                courseId: courseId,
                                actionType: "edited",
                                dateAdded: doc.dateUpdated
                                //performedByUserId: doc.createdBy
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
        //console.log(newVote);
        Votes.findOne({_id: newVote._id})
            .exec(function (err, doc) {
                if (doc) {
                    var postId = doc.voteTypeId;
                    var voteType = doc.voteType;
                    var voteValue = "";
                    if (doc.voteValue == 1) {
                        voteValue = "up voted";
                    } else if (doc.voteValue == -1) {
                        voteValue = "down voted";
                    } else {
                        voteValue = "canceled vote";
                    }
                    if (voteType == "slideComment") {
                        PdfAnnotation.findOne({_id: doc.voteTypeId})
                            .exec(function (err, res) {
                                if (res) {
                                    var pdfId = res.pdfId;
                                    if (pdfId) {
                                        Resources.findOne({_id: pdfId})
                                            .exec(function (err, resResources) {
                                                if (resResources) {
                                                    SubTopics.findOne({_id: resResources.treeNodeId})
                                                        .exec(function (err, resSubTopics) {
                                                            if (resSubTopics) {
                                                                var pdfName = resSubTopics.name;
                                                                var nf = new NewsfeedAgg(
                                                                    {
                                                                        userId: doc.createdBy,
                                                                        actionSubjectIds: postId,
                                                                        actionSubject: "pdf annotation",
                                                                        actionName: pdfName,
                                                                        courseId: resSubTopics.courseId,
                                                                        nodeId: resSubTopics.id,
                                                                        actionType: voteValue,
                                                                        dateAdded: doc.dateUpdated
                                                                    }
                                                                );
                                                                nf.save(
                                                                    function (err, doc) {
                                                                        if (!err) debug('');
                                                                        else debug(err);
                                                                    }
                                                                )
                                                            }
                                                        })
                                                }
                                            })
                                    }
                                }
                            })
                    } else if (voteType == "videoAnnotation") {
                        VideoAnnotation.findOne({_id: doc.voteTypeId})
                            .exec(function (err, res) {
                                if (res) {
                                    var videoId = res.video_id;
                                    if (videoId) {
                                        Resources.findOne({_id: videoId})
                                            .exec(function (err, resResources) {
                                                if (resResources) {
                                                    SubTopics.findOne({_id: resResources.treeNodeId})
                                                        .exec(function (err, resSubTopics) {
                                                            if (resSubTopics) {
                                                                var videoName = resSubTopics.name;
                                                                var nf = new NewsfeedAgg(
                                                                    {
                                                                        userId: doc.createdBy,
                                                                        actionSubjectIds: postId,
                                                                        actionSubject: "video annotation",
                                                                        actionName: videoName,
                                                                        courseId: resSubTopics.courseId,
                                                                        nodeId: resSubTopics.id,
                                                                        actionType: voteValue,
                                                                        dateAdded: doc.dateUpdated
                                                                    }
                                                                );
                                                                nf.save(
                                                                    function (err, doc) {
                                                                        if (!err) debug('');
                                                                        else debug(err);
                                                                    }
                                                                )
                                                            }
                                                        });

                                                }
                                            });
                                    }
                                }
                            })

                    } else if (voteType == "link") {
                        Links.findOne({_id: doc.voteTypeId})
                            .exec(function (err, res) {
                                if (res) {
                                    var contentNodeId = res.contentNode;
                                    if (contentNodeId) {
                                        SubTopics.findOne({_id: contentNodeId})
                                            .exec(function (err, resSubTopics) {
                                                if (resSubTopics) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.createdBy,
                                                            actionSubjectIds: postId,
                                                            actionSubject: voteType,
                                                            actionName: res.title,
                                                            courseId: resSubTopics.courseId,
                                                            nodeId: resSubTopics.id,
                                                            actionType: voteValue,
                                                            dateAdded: doc.dateUpdated
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else debug(err);
                                                        }
                                                    );
                                                }
                                            })
                                    }
                                }
                            })
                    } else if (voteType == "external resource") {
                        ExtResources.posts.findOne({postId: doc.voteTypeId})
                            .exec(function (err, res) {
                                if (res) {
                                    var contentNodeId = res.contentId;
                                    if (contentNodeId) {
                                        SubTopics.findOne({_id: contentNodeId})
                                            .exec(function (err, resSubTopics) {
                                                if (resSubTopics) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.createdBy,
                                                            actionSubjectIds: postId,
                                                            actionSubject: voteType,
                                                            actionName: res.title,
                                                            courseId: resSubTopics.courseId,
                                                            nodeId: resSubTopics.id,
                                                            actionType: voteValue,
                                                            dateAdded: doc.dateUpdated
                                                        }
                                                    );
                                                    nf.save(
                                                        function (err, doc) {
                                                            if (!err) debug('');
                                                            else debug(err);
                                                        }
                                                    );
                                                }
                                            })
                                    }
                                }
                            })
                    } else if (voteType == "discussion" || "discussionReply") {

                        if (voteType == "discussionReply")
                            voteType = "reply in discussion";

                        Posts.findOne({_id: postId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.course;
                                    var postName = result.title;
                                    if (courseId) { //If there is courseId then it is discussion otherwise reply
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: newVote.createdBy, //userId: user who vote
                                                actionSubjectIds: postId, //actionSubjectIds: voteTypeId
                                                actionSubject: voteType, //actionSubject: either discussion, link or comment in resource
                                                actionName: postName, // actionName: title of discussion/link or empty if resource comment
                                                courseId: courseId, // self explanatory
                                                actionType: voteValue, //upvote downvote, cancel vote (voteValue)
                                                dateAdded: newVote.dateUpdated // self explanatory
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
                                                        console.log(parentResult);
                                                        var nf = new NewsfeedAgg(
                                                            {
                                                                userId: newVote.createdBy,
                                                                actionSubjectIds: parentResult._id,
                                                                actionSubject: voteType,
                                                                actionName: parentResult.title,
                                                                courseId: parentResult.course,
                                                                actionType: voteValue,
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

    onAfterSubTopicEdited: function (editSubTopic, user) {
        SubTopics.findOne({_id: editSubTopic._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: user._id,
                                actionSubjectIds: doc.id,
                                actionSubject: "sub topic",
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
                                nodeId: doc.id,
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

    onAfterContentNodeEdited: function (editContentNode, params) {
        SubTopics.findOne({_id: editContentNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: params.userId,
                                actionSubjectIds: doc.id,
                                actionSubject: "content node",
                                actionName: doc.name,
                                courseId: courseId,
                                nodeId: doc.id,
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

    onAfterNodeDeleted: function (deleteNode, user) {
        SubTopics.findOne({_id: deleteNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    if (doc.type == 'subTopic') {
                        var actSubj = 'sub topic';
                    } else {
                        var actSubj = 'content node';
                    }
                    var courseId = doc.courseId;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: user._id,
                                actionSubjectIds: doc.id,
                                actionSubject: actSubj,
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

                        NewsfeedAgg.updateMany(
                            {nodeId: doc.id},
                            {$set: {"isSubjectDeleted": true}},
                            function (err) {
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
                            .exec(function (err, result) {
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id: treeNodeId})
                                            .exec(function (err, res) {
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID,
                                                            actionSubjectIds: pdfId,
                                                            actionSubject: "pdf annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
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

    onAfterPdfAnnotationEdited: function (newPdfAnnotation, user) {
        PdfAnnotation.findOne({_id: newPdfAnnotation.updateId})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function (err, result) {
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    var curDate = Date.now();
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id: treeNodeId})
                                            .exec(function (err, res) {
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: user._id,
                                                            actionSubjectIds: pdfId,
                                                            actionSubject: "pdf annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
                                                            actionType: "edited",
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
                            })
                    }
                }
            });

    },

    onAfterPdfAnnotationDeleted: function (deletePdfAnnotation, user) {
        var userId = user._id;
        var pdfId = deletePdfAnnotation.pdfId;
        if (pdfId) {
            Resources.findOne({_id: pdfId})
                .exec(function (err, result) {
                    if (result) {
                        var treeNodeId = result.treeNodeId;
                        if (treeNodeId) {
                            SubTopics.findOne({_id: treeNodeId})
                                .exec(function (err, res) {
                                    if (res) {
                                        var curDate = Date.now();
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: userId,
                                                actionSubjectIds: pdfId,
                                                actionSubject: "pdf annotation",
                                                actionName: res.name,
                                                courseId: result.courseId,
                                                nodeId: res.id,
                                                actionType: "deleted",
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

                                        NewsfeedAgg.updateMany(
                                            {actionSubjectIds: pdfId},
                                            {$set: {"isSubjectDeleted": true}},
                                            function (err) {
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
    },

    onAfterPdfReplyCreated: function (newPdfAnnotationReply) {
        PdfAnnotation.findOne({_id: newPdfAnnotationReply._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function (err, result) {
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id: treeNodeId})
                                            .exec(function (err, res) {
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorID,
                                                            actionSubjectIds: pdfId,
                                                            actionSubject: "pdf annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
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

    /*onAfterAnnotationZonePdfCreated: function (newPdfAnnotationZone) {
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
     nodeId: res.id,
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
     nodeId: res.id,
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
     },*/

    //Listener for Video
    onAfterVideoAnnotationCreated: function (newVideoAnnotation) {
        VideoAnnotation.findOne({_id: newVideoAnnotation})
            .exec(function (err, doc) {
                if (doc) {
                    var videoId = doc.video_id;
                    if (videoId) {
                        Resources.findOne({_id: videoId})
                            .exec(function (err, result) {
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id: treeNodeId})
                                            .exec(function (err, res) {
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorId,
                                                            actionSubjectIds: videoId,
                                                            actionSubject: "video annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
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
        VideoAnnotation.findOne({_id: editVideoAnnotation})
            .exec(function (err, doc) {
                if (doc) {
                    var videoId = doc.video_id;
                    if (videoId) {
                        Resources.findOne({_id: videoId})
                            .exec(function (err, result) {
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id: treeNodeId})
                                            .exec(function (err, res) {
                                                if (res) {
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorId,
                                                            actionSubjectIds: videoId,
                                                            actionSubject: "video annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
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

    onAfterVideoAnnotationDeleted: function (deleteVideoAnnotation, user) {
        var videoId = deleteVideoAnnotation.video_id;
        var userId = user;
        var dateAdded = deleteVideoAnnotation.date_modified;
        Resources.findOne({_id: videoId})
            .exec(function (err, result) {
                if (result) {
                    var treeNodeId = result.treeNodeId;
                    if (treeNodeId) {
                        SubTopics.findOne({_id: treeNodeId})
                            .exec(function (err, res) {
                                if (res) {
                                    var curDate = Date.now();
                                    var nf = new NewsfeedAgg(
                                        {
                                            userId: userId,
                                            actionSubjectIds: videoId,
                                            actionSubject: "video annotation",
                                            actionName: res.name,
                                            courseId: result.courseId,
                                            nodeId: res.id,
                                            actionType: "deleted",
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

                                    NewsfeedAgg.updateMany(
                                        {actionSubjectIds: videoId},
                                        {$set: {"isSubjectDeleted": true}},
                                        function (err) {
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
    },

    onAfterVideoCommentCreated: function (newVideoComment, user) {
        VideoAnnotation.findOne({_id: newVideoComment})
            .exec(function (err, doc) {
                if (doc) {
                    var videoId = doc.video_id;
                    if (videoId) {
                        Resources.findOne({_id: videoId})
                            .exec(function (err, result) {
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id: treeNodeId})
                                            .exec(function (err, res) {
                                                if (res) {
                                                    var curDate = Date.now();
                                                    var nf = new NewsfeedAgg(
                                                        {
                                                            userId: doc.authorId,
                                                            actionSubjectIds: videoId,
                                                            actionSubject: "video annotation",
                                                            actionName: res.name,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
                                                            actionType: "replied",
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
                        SubTopics.findOne({_id: contentId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: doc.createdBy,
                                                actionSubjectIds: doc.id,
                                                actionSubject: "link",
                                                actionName: doc.title,
                                                courseId: courseId,
                                                nodeId: result.id,
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

    onAfterLinkEdited: function (editLink, user) {
        Links.findOne({_id: editLink.linkId})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        SubTopics.findOne({_id: contentId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var dateNow = new Date();
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: user._id,
                                                actionSubjectIds: doc.id,
                                                actionSubject: "link",
                                                actionName: doc.title,
                                                courseId: courseId,
                                                nodeId: result.id,
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
                                }
                            })
                    }

                }
            });

    },

    onAfterLinkDeleted: function (deleteLink, user) {
        Links.findOne({_id: deleteLink.linkId})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentNode;
                    if (contentId) {
                        SubTopics.findOne({_id: contentId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var dateNow = new Date();
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: user._id,
                                                actionSubjectIds: doc.id,
                                                actionSubject: "link",
                                                actionName: doc.title,
                                                courseId: courseId,
                                                nodeId: result.id,
                                                actionType: "deleted",
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

                                        NewsfeedAgg.updateMany(
                                            {actionSubjectIds: doc.id},
                                            {$set: {"isSubjectDeleted": true}},
                                            function (err) {
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

    //Listener for External Resources
    onAfterLearningHubLinkCreated: function (newExtRes) {
        ExtResources.posts.findOne({postId: newExtRes.postId})
            .exec(function (err, doc) {
                //var linkId = doc.
                if (doc) {
                    var contentId = doc.contentId;
                    if (contentId) {
                        SubTopics.findOne({_id: contentId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: doc.userId,
                                                actionSubjectIds: doc.postId,
                                                actionSubject: "external resource",
                                                actionName: doc.title,
                                                courseId: courseId,
                                                nodeId: result.id,
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

    onAfterLearningHubLinkEdited: function (editExtRes, user) {
        ExtResources.posts.findOne({postId: editExtRes.postId})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentId;
                    if (contentId) {
                        SubTopics.findOne({_id: contentId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var dateNow = new Date();
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: user._id,
                                                actionSubjectIds: doc.postId,
                                                actionSubject: "external resource",
                                                actionName: doc.title,
                                                courseId: courseId,
                                                nodeId: result.id,
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
                                }
                            })
                    }

                }
            });

    },

    onAfterLearningHubLinkDeleted: function (deleteExtResource, user) {
        ExtResources.posts.findOne({postId: deleteExtResource.postId})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentId;
                    if (contentId) {
                        SubTopics.findOne({_id: contentId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var dateNow = new Date();
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: user._id,
                                                actionSubjectIds: doc.postId,
                                                actionSubject: "external resource",
                                                actionName: doc.title,
                                                courseId: courseId,
                                                nodeId: result.id,
                                                actionType: "deleted",
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

                                        NewsfeedAgg.updateMany(
                                            {actionSubjectIds: doc.postId},
                                            {$set: {"isSubjectDeleted": true}},
                                            function (err) {
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

    onAfterLearningHubCommentAdded: function (extRes, comment) {
        ExtResources.posts.findOne({postId: extRes.postId})
            .exec(function (err, doc) {
                //var linkId = doc.
                if (doc) {
                    var contentId = doc.contentId;
                    if (contentId) {
                        SubTopics.findOne({_id: contentId})
                            .exec(function (err, result) {
                                if (result) {
                                    const [key, newComment] = Object.entries(doc.comments).find(([key, comment]) => comment._id === comment._id);
                                    if (newComment) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: newComment.authorId,
                                                actionSubjectIds: doc.postId,
                                                actionSubject: "external resource",
                                                actionName: doc.title,
                                                courseId: doc.courseId,
                                                nodeId: result.id,
                                                actionType: "commented",
                                                dateAdded: newComment.dateAdded
                                            }
                                        );
                                        nf.save(
                                            function (err, doc) {
                                                console.log(doc);
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
    onAfterDiscussionCreated: function (newDiscussion) {
        Posts.findOne({_id: newDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    //if reply to discussion
                    if (doc.parentPost) {
                        Posts.findOne({_id: doc.parentPost})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.course;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: newDiscussion.createdBy,
                                                actionSubjectIds: result.id,
                                                actionSubject: "discussion",
                                                actionName: result.title,
                                                courseId: courseId,
                                                actionType: "replied",
                                                dateAdded: newDiscussion.dateAdded
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
                    } else {
                        var courseId = doc.course;
                        if (courseId) {
                            var nf = new NewsfeedAgg(
                                {
                                    userId: doc.createdBy,
                                    actionSubjectIds: doc.id,
                                    actionSubject: "discussion",
                                    actionName: doc.title,
                                    courseId: courseId,
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
                }
            });

    },

    onAfterDiscussionEdited: function (editDiscussion, user) {
        Posts.findOne({_id: editDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    if (courseId) {
                        var nf = new NewsfeedAgg(
                            {
                                userId: user._id,
                                actionSubjectIds: doc.id,
                                actionSubject: "discussion",
                                actionName: doc.title,
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

    onAfterDiscussionDeleted: function (deleteDiscussion, user) {
        Posts.findOne({_id: deleteDiscussion.postId})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    if (courseId) {
                        var curDate = Date.now();
                        var nf = new NewsfeedAgg(
                            {
                                userId: user._id,
                                actionSubjectIds: doc.id,
                                actionSubject: "discussion",
                                actionName: doc.title,
                                courseId: courseId,
                                actionType: "deleted",
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

                        NewsfeedAgg.updateMany(
                            {actionSubjectIds: doc.id},
                            {$set: {"isSubjectDeleted": true}},
                            function (err) {
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
    onAfterEnrollorLeaveCourse: function (userEnrollment) {
        UserCourses.findOne({_id: userEnrollment._id})
            .exec(function (err, doc) {
                if (doc) {
                    var userStatus = (doc.isEnrolled === true) ? 'enrolled' : 'left';
                    var curDate = Date.now();
                    var courseId = doc.course;
                    if (courseId) {
                        Courses.findOne({_id: courseId})
                            .exec(function (err, result) {
                                if (result) {
                                    var nf = new NewsfeedAgg(
                                        {
                                            userId: doc.user,
                                            actionSubjectIds: doc.id,
                                            actionSubject: "course",
                                            actionName: result.name,
                                            courseId: courseId,
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
        //TODO: move below listener to its own place since its not belong to newsfeed scope
        //update totalEnrollment in course model each time someone enroll/leave course. (for popularity sorting course list)
        UserCourses.findOne({_id: userEnrollment._id})
            .exec(function (err, doc) {
                if (doc) {
                    var counter = (doc.isEnrolled === true) ? 1 : -1;
                    var courseId = doc.course;
                    if (courseId) {
                        var condition = {_id: courseId}, update = {$inc: {totalEnrollment: counter}};
                        Courses.findOne(condition)
                            .exec(function (err, result) {
                                if (result) {
                                    Courses.update(condition, update).exec();
                                } else {
                                    console.log('Cannot find course');
                                }
                            })

                    }

                }
            });
    }


};

module.exports = NewsfeedListener;
