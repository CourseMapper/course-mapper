var debug = require('debug')('cm:server');
var NewsfeedAgg = require('./models/newsfeed.model.js');
var Votes = require('../../votes/models/votes.js');
var SubTopics = require('../../trees/treeNodes.js');
var Post = require('../../discussion/models/posts.js');

var NewsfeedListener = {


    onAfterVoted: function (newVote) {
        Votes.findOne({_id: newVote._id})
            .exec(function (err, doc) {
                if (doc) {
                    var postId = doc.voteTypeId;
                    var voteType = doc.voteType;
                    if (voteType == "discussion"|| "discussionReply") {

                        Post.findOne({_id: postId})
                            .exec(function (err, result) {
                                if (result) {
                                    var courseId = result.course;
                                    var postName = result.title;
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: newVote.createdBy,
                                                actionSubjectIds: postId,
                                                actionSubject: "vote",
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
                                            Post.findOne({_id: result.parentPost})
                                                .exec(function (err, parentResult) {
                                                    if (parentResult) {
                                                        var nf = new NewsfeedAgg(
                                                            {
                                                                userId: newVote.createdBy,
                                                                actionSubjectIds: postId,
                                                                actionSubject: "vote",
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

    }


};

module.exports = NewsfeedListener;
