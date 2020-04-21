/**
 *
 * List of all listener related to my course
 *
 */

//var appRoot = require('app-root-path');
//var Plugins = require(appRoot + '/app-root-path');

var debug = require('debug')('cm:server');
var CreatedNodes = require('./models/myCreatedNodes.js');
var PdfRead = require('./models/myPDFStatus.js');
var VideoRead = require('./models/myVideoStatus.model.js');
var Posts = require('../../discussion/models/posts.js');
var MyActivityStatus = require('./models/myActivityStatus.model.js');
var MyDiscussionStatus = require('./models/myDiscussionStatus.model.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var Resources = require('../../trees/resources.js');
var Links = require('../../links/models/links.js');
var SubTopics = require('../../trees/treeNodes.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var ExtResources = require('../../learningHub/models/hub.js');



var MyCourseListener = {
    /**
     * an example of hook on this event onAfterSubTopicCreated
     * this will push/aggregate a newly created subtopic Id into a document for easy use later
     */
    onAfterSubTopicCreated: function(newSubTopic){
        CreatedNodes.findOneAndUpdate(
            {userId: newSubTopic.createdBy, nodeType: "subTopic"},
            {$push: {"treeNodeIds": newSubTopic._id}},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            });

        /*CreatedNodes.findOne({userId: newSubTopic.createdBy, nodeType: "subTopic"}).
            exec(function(doc){
                if(doc){
                    doc.treeNodeIds.push(newSubTopic._id);
                }else{
                    var cn = new CreatedNodes({
                        userId: newSubTopic.createdBy,
                        treeNodeIds: [newSubTopic._id],
                        nodeType: "subTopic"
                    });

                    cn.save();
                }
            });*/
    },

    /**
     * an example of hook on this event onAfterSubTopicCreated
     * this will push/aggregate a newly created subtopic Id into a document for easy use later
     */
    onAfterContentNodeCreated: function(newContentNode){
        CreatedNodes.findOneAndUpdate(
            {userId: newContentNode.createdBy, nodeType: "contentNode"},
            {$push: {"treeNodeIds": newContentNode._id}},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            });
    },
    //listener each time user read a pdf save in collection my-course-mypdfstatuses
    onPdfRead: function(params){
        PdfRead.findOneAndUpdate(
            {
                userId: params.userId,
                courseId:params.courseId,
                resourceId:params.resourceId,
                nodeId:params.nodeId
            },
            {$set: {
                "pageNumber":params.pageNumber,
                "totalPage":params.totalPage,
                "dateAdded": new Date(),
                "dateUpdated": new Date()
            }},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            }
        );
    },

    //listener each time user watch video, save in collection myvideostatuses
    onVideoUpdateState: function(params){
        VideoRead.findOneAndUpdate(
            {
                userId: params.userId,
                courseId:params.courseId,
                resourceId:params.resourceId,
                nodeId:params.nodeId
            },
            {$set: {
                "totalTime":params.totalTime,
                "currentTime":params.currentTime,
                "dateAdded": new Date(),
                "dateUpdated": new Date()
            }},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            }
        );
    },

    //if a node deleted, remove all related document in collection myvideostatuses and my-course-mypdfstatuses to avoid unlinked document
    onAfterNodeDeleted: function(deleteNode) {
        PdfRead.find({nodeId:deleteNode._id}).remove().exec();
        VideoRead.find({nodeId:deleteNode._id}).remove().exec();
        //also set isDeleted:true to all related content node activity in myactivitystatuses collection
        var condition = {nodeId:deleteNode._id};
        var update = {$set: {isDeleted: true}};
        MyActivityStatus.find(condition)
            .exec(function (err, resAS){
                if (resAS) {
                    MyActivityStatus.update(condition, update, {multi:true}).exec();
                } else {
                    console.log('cannot find documents');
                }
            })

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
                                                    var nf = new MyActivityStatus(
                                                        {
                                                            userId: doc.authorID,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
                                                            resourceId: pdfId,
                                                            type: "pdf annotation",
                                                            isDeleted: false
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

    onAfterPdfAnnotationDeleted: function (deletePdfAnnotation) {
        var userId = deletePdfAnnotation.authorID;
        var pdfId = deletePdfAnnotation.pdfId;
        if (pdfId) {
            Resources.findOne({_id: pdfId})
                .exec(function(err, result){
                    if (result) {
                        var treeNodeId = result.treeNodeId;
                        if (treeNodeId){
                            SubTopics.findOne({_id:treeNodeId})
                                .exec(function(err, res){
                                    if (res) {
                                        var condition =
                                            {
                                                userId: userId,
                                                courseId: result.courseId,
                                                nodeId: res.id,
                                                resourceId: pdfId,
                                                type: "pdf annotation",
                                                isDeleted: false
                                            };
                                        var update = {$set: {isDeleted: true}};
                                        MyActivityStatus.findOne(condition)
                                            .exec(function (err, resAS){
                                                if (resAS) {
                                                    MyActivityStatus.update(condition, update).exec();
                                                } else {
                                                    console.log('cannot find documents');
                                                }
                                            })
                                        
                                    }

                                })



                        }

                    }
                })
        }
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
                                                    var nf = new MyActivityStatus(
                                                        {
                                                            userId: doc.authorId,
                                                            courseId: result.courseId,
                                                            nodeId: res.id,
                                                            resourceId: videoId,
                                                            type: "video annotation",
                                                            isDeleted: false
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
        var videoId = deleteVideoAnnotation.video_id;
        var userId = deleteVideoAnnotation.authorId;
        Resources.findOne({_id:videoId})
            .exec(function(err, result){
                if (result) {
                    var treeNodeId = result.treeNodeId;
                    if (treeNodeId) {
                        SubTopics.findOne({_id: treeNodeId})
                            .exec(function (err, res) {
                                if (res) {
                                    var condition =
                                    {
                                        userId: userId,
                                        courseId: result.courseId,
                                        nodeId: res.id,
                                        resourceId: videoId,
                                        type: "video annotation",
                                        isDeleted: false
                                    };
                                    var update = {$set: {isDeleted: true}};
                                    MyActivityStatus.findOne(condition)
                                        .exec(function (err, resAS){
                                            if (resAS) {
                                                MyActivityStatus.update(condition, update).exec();
                                            } else {
                                                console.log('cannot find documents');
                                            }
                                        })

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
                                        var nf = new MyActivityStatus(
                                            {
                                                userId: doc.createdBy,
                                                courseId:  courseId,
                                                nodeId: result.id,
                                                resourceId: doc._id,
                                                type: "link",
                                                isDeleted: false
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
        Links.findOne({_id: deleteLink.linkId})
            .exec(function (err, doc) {
                if (doc) {
                    var userId = doc.createdBy;
                    var contentId = doc.contentNode;
                    if (contentId) {
                        SubTopics.findOne({_id:contentId})
                            .exec(function(err, result){
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var condition =
                                        {
                                            userId: userId,
                                            courseId: courseId,
                                            nodeId: result._id,
                                            resourceId: doc._id,
                                            type: "link",
                                            isDeleted: false
                                        };
                                        var update = {$set: {isDeleted: true}};
                                        MyActivityStatus.findOne(condition)
                                            .exec(function (err, resAS){
                                                if (resAS) {
                                                    MyActivityStatus.update(condition, update).exec();
                                                } else {
                                                    console.log('cannot find documents');
                                                }
                                            })

                                    }
                                }
                            })
                    }

                }
            });

    },

    //Listener for External Resources
    onAfterLearningHubLinkCreated: function (newExtRes) {
        ExtResources.posts.findOne({_id: newExtRes._id})
            .exec(function (err, doc) {
                if (doc) {
                    var contentId = doc.contentId;
                    if (contentId) {
                        SubTopics.findOne({_id:contentId})
                            .exec(function(err, result){
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var nf = new MyActivityStatus(
                                            {
                                                userId: doc.userId,
                                                courseId:  courseId,
                                                nodeId: result.id,
                                                resourceId: doc._id,
                                                type: "ext-resource",
                                                isDeleted: false
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
                        SubTopics.findOne({_id:contentId})
                            .exec(function(err, result){
                                if (result) {
                                    var courseId = result.courseId;
                                    if (courseId) {
                                        var condition =
                                            {
                                                userId: user._id,
                                                courseId: courseId,
                                                nodeId: result._id,
                                                resourceId: doc._id,
                                                type: "ext-resource",
                                                isDeleted: false
                                            };
                                        var update = {$set: {isDeleted: true}};
                                        MyActivityStatus.findOne(condition)
                                            .exec(function (err, resAS){
                                                if (resAS) {
                                                    MyActivityStatus.update(condition, update).exec();
                                                } else {
                                                    console.log('cannot find documents');
                                                }
                                            });

                                    }
                                }
                            });
                    }
                }
            });
    },

    //Listener for Discussion
    onAfterDiscussionCreated: function (newDiscussion){
        Posts.findOne({_id: newDiscussion._id})
            .exec(function (err, doc) {
                if (doc) {
                    //if not reply to discussion
                    if (!doc.parentPost) {
                        var courseId = doc.course;
                        if (courseId) {
                            var nf = new MyDiscussionStatus(
                                {
                                    userId: doc.createdBy,
                                    courseId: courseId,
                                    discussionId: doc._id,
                                    type: "discussion",
                                    isDeleted: false
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

    onAfterDiscussionDeleted: function (deleteDiscussion){
        Posts.findOne({_id: deleteDiscussion.postId})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.course;
                    if (courseId) {
                        var condition =
                            {
                                userId: doc.createdBy,
                                courseId:  courseId,
                                discussionId: doc._id,
                                type: "discussion",
                                isDeleted: false
                            };
                        var update = {$set: {isDeleted: true}};
                        MyDiscussionStatus.findOne(condition)
                            .exec(function (err, resDS){
                                if (resDS) {
                                    MyDiscussionStatus.update(condition, update).exec();
                                } else {
                                    console.log('cannot find documents');
                                }
                            })
                    }

                }
            });

    }

};

module.exports = MyCourseListener;
