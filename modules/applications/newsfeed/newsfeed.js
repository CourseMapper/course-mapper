var debug = require('debug')('cm:server');
var NewsfeedAgg = require('./models/newsfeed.model.js');
var Votes = require('../../votes/models/votes.js');
//var Discussion = require('../../discussion/models/courseDiscussions.js');
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
                                    if (courseId) {
                                        var nf = new NewsfeedAgg(
                                            {
                                                userId: newVote.createdBy,
                                                actionSubjectIds: postId,
                                                actionSubject: "vote",
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
        /*
         var nf = new NewsfeedAgg(
         {userId: newVote.createdBy, actionSubjectIds: postId , actionSubject: "vote", courseId: courseId,  actionType : "added", dateAdded: newVote.dateUpdated}
         );
         nf.save(

         function(err, doc){
         if(!err) debug('');
         else
         debug(err);
         });
         */
    }
};

module.exports = NewsfeedListener;
